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
import { Tracing } from 'aws-cdk-lib/aws-lambda';

interface PredictConstructProps extends cdk.StackProps {
  api: appsync.GraphqlApi;
  table: dynamodb.Table;
  bucket: s3.Bucket;
  speechSecretArn?: string;
}

export class PredictConstruct extends Construct {
  readonly voiceLambda: NodejsFunction;
  readonly predictAsyncLambda: NodejsFunction;
  readonly queue: sqs.Queue;
  readonly queueLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: PredictConstructProps) {
    super(scope, id);

    const { bucket, table, api, speechSecretArn } = props;

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

    // Gets Secret from Secrets Manager
    let speechSecret;
    if (speechSecretArn) {
      speechSecret = secretsmanager.Secret.fromSecretCompleteArn(
        this,
        'SpeechSecret',
        speechSecretArn
      );
    }

    // Queue Lambda
    this.queueLambda = new NodejsFunction(this, 'PredictAsyncQueueLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambdas/queue-trigger/index.ts'),
      environment: {
        QUEUE_URL: this.queue.queueUrl,
        TABLE_NAME: table.tableName
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 256,
      tracing: Tracing.ACTIVE
    });

    this.predictAsyncLambda = new NodejsFunction(this, 'PredictAsyncLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambdas/predict-async/index.ts'),
      environment: {
        GRAPHQL_URL: api.graphqlUrl,
        SPEECH_SECRET: speechSecretArn || '',
        S3_BUCKET: bucket.bucketName
      },
      bundling: {
        nodeModules: ['langchain'],
        minify: true,
        sourceMap: true
      },
      memorySize: 756,
      timeout: cdk.Duration.seconds(60),
      initialPolicy: [
        // Allow the lambda to call AppSync
        new iam.PolicyStatement({
          resources: [`${api.arn}/*`],
          actions: ['appsync:GraphQL']
        })
      ],
      tracing: Tracing.ACTIVE
    });

    // Voice Lambda
    this.voiceLambda = new NodejsFunction(this, 'VoiceLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambdas/voice/index.ts'),
      environment: {
        S3_BUCKET: bucket.bucketName,
        SPEECH_SECRET: speechSecret?.secretArn || ''
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(30),
      tracing: Tracing.ACTIVE
    });

    // Add additional permissions to the predictAsyncLambda
    this.predictAsyncLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
    );

    // Add SQS permission to the queue lambda
    this.queue.grantSendMessages(this.queueLambda);

    // Grant read/write data access to the DynamoDB table for the queueLambda
    table.grantReadWriteData(this.queueLambda);

    // Grant read access to the speech secret for the predictAsyncLambda and voiceLambda
    speechSecret?.grantRead(this.predictAsyncLambda);
    speechSecret?.grantRead(this.voiceLambda);

    // Grant read/write access to the S3 bucket for the voiceLambda and predictAsyncLambda
    bucket.grantReadWrite(this.voiceLambda, 'audio/*');
    bucket.grantReadWrite(this.predictAsyncLambda, 'audio/*');

    // Trigger the predictAsyncLambda when a message is sent to the SQS queue
    this.predictAsyncLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(this.queue)
    );
  }
}
