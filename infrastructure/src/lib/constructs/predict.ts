import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface PredictConstructProps extends cdk.StackProps {
  api: appsync.GraphqlApi;
  table: dynamodb.Table;
  bucket: s3.Bucket;
}

export class PredictConstruct extends Construct {
  readonly voiceLambda: NodejsFunction;
  readonly predictAsyncLambda: NodejsFunction;
  readonly queue: sqs.Queue;
  readonly queueLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: PredictConstructProps) {
    super(scope, id);

    // Deadletter queue - For keeping track of failed messages.
    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    // SQS Queue - For storing messages to be processed so that the lambda can be invoked asynchronously.
    this.queue = new sqs.Queue(this, 'EventQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1 // After 1 failed attempt, send to deadletter queue
      }
    });

    // Create azure speech secret with region and key.
    const speechSecret = new secretsmanager.Secret(this, 'AzureSpeechSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ region: 'value', key: 'value' }),
        generateStringKey: 'key'
      }
    });

    // Queue Lambda
    this.queueLambda = new NodejsFunction(this, 'PredictAsyncQueueLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../assets/lambdas/queue-trigger/index.ts'),
      environment: {
        QUEUE_URL: this.queue.queueUrl,
        TABLE_NAME: props.table.tableName
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 256,
      initialPolicy: [
        // Allow the lambda to call SQS
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sqs:*'],
          resources: [this.queue.queueArn]
        })
      ]
    });

    this.predictAsyncLambda = new NodejsFunction(this, 'PredictAsyncLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../assets/lambdas/predict-async/index.ts'),
      environment: {
        GRAPHQL_URL: props.api.graphqlUrl,
        AZURE_SPEECH_SECRET: speechSecret.secretArn,
        S3_BUCKET: props.bucket.bucketName
      },
      bundling: {
        nodeModules: ['langchain'],
        minify: true,
        sourceMap: true
      },
      memorySize: 756,
      timeout: cdk.Duration.seconds(30),
      initialPolicy: [
        // Allow the lambda to call Bedrock
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['bedrock:*'],
          resources: [`*`]
        }),

        // Allow the lambda to call AppSync
        new iam.PolicyStatement({
          resources: [`${props.api.arn}/*`],
          actions: ['appsync:GraphQL']
        })
      ]
    });

    // Voice Lambda
    this.voiceLambda = new NodejsFunction(this, 'VoiceLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../assets/lambdas/voice/index.ts'),
      environment: {
        S3_BUCKET: props.bucket.bucketName,
        AZURE_SPEECH_SECRET: speechSecret.secretArn
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(30)
    });

    props.table.grantReadWriteData(this.queueLambda);
    speechSecret.grantRead(this.predictAsyncLambda);

    // Grants the lambda permission to get the Azure speech secret.
    speechSecret.grantRead(this.voiceLambda);

    // Grants the lambda permission to write/read to/from the S3 bucket.
    // This is limited to the audio prefix.
    props.bucket.grantReadWrite(this.voiceLambda, 'audio/*');
    props.bucket.grantReadWrite(this.predictAsyncLambda, 'audio/*');

    // Trigger the AI Lambda when a message is sent to the SQS queue.
    this.predictAsyncLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(this.queue)
    );
  }
}
