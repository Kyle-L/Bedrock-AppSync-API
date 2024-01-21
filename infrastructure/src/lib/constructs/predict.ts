import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import path = require('path');
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
interface PredictConstructProps extends cdk.StackProps {
  appSyncApi: appsync.GraphqlApi;
  conversationHistoryTable: dynamodb.Table;
}

export class PredictConstruct extends Construct {
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

    // S3 bucket for storing audio files and other assets.
    const s3Bucket = new s3.Bucket(this, 'PredictionBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1)
        }
      ]
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
        TABLE_NAME: props.conversationHistoryTable.tableName
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
        GRAPHQL_URL: props.appSyncApi.graphqlUrl,
        AZURE_SPEECH_SECRET: speechSecret.secretArn,
        S3_BUCKET: s3Bucket.bucketName
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
          resources: [`${props.appSyncApi.arn}/*`],
          actions: ['appsync:GraphQL']
        })
      ]
    });

    props.conversationHistoryTable.grantReadWriteData(this.queueLambda);
    speechSecret.grantRead(this.predictAsyncLambda);
    s3Bucket.grantReadWrite(this.predictAsyncLambda);

    // Trigger the AI Lambda when a message is sent to the SQS queue.
    this.predictAsyncLambda.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(this.queue));
  }
}
