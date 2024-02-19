import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as path from 'path';

interface PredictConstructProps extends cdk.StackProps {
  api: appsync.GraphqlApi;
  table: dynamodb.Table;
  bucket: s3.Bucket;
  speechSecretArn?: string;
}

export class PredictConstruct extends Construct {
  readonly predictAsyncLambda: NodejsFunction;
  readonly queue: sqs.Queue;
  readonly queueLambda: NodejsFunction;
  readonly deadLetterQueue: sqs.Queue;
  readonly deadLetterLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: PredictConstructProps) {
    super(scope, id);

    const { bucket, table, api, speechSecretArn } = props;

    // Deadletter queue - For keeping track of failed messages.
    this.deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue');

    // SQS Queue - For storing messages to be processed so that the lambda can be invoked asynchronously.
    this.queue = new sqs.Queue(this, 'EventQueue', {
      visibilityTimeout: cdk.Duration.seconds(60),
      deadLetterQueue: {
        queue: this.deadLetterQueue,
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
    this.queueLambda = new NodejsFunction(this, 'PredictAsyncQueue', {
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
      tracing: Tracing.ACTIVE
    });

    // Deadletter Lambda
    this.deadLetterLambda = new NodejsFunction(this, 'DeadLetter', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambdas/deadletter/index.ts'),
      environment: {
        TABLE_NAME: table.tableName
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      tracing: Tracing.ACTIVE
    });

    // Predict Async Lambda
    this.predictAsyncLambda = new NodejsFunction(this, 'PredictAsync', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambdas/predict-async/index.ts'),
      environment: {
        GRAPHQL_URL: api.graphqlUrl,
        SPEECH_SECRET: speechSecretArn || '',
        S3_BUCKET: bucket.bucketName,
        TABLE_NAME: table.tableName
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

    // Add additional permissions to the predictAsyncLambda
    this.predictAsyncLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
    );

    // Add SQS permission to the queue lambda
    this.queue.grantSendMessages(this.queueLambda);

    // Grant read/write data access to the DynamoDB table for the queueLambda
    table.grantReadWriteData(this.queueLambda);
    table.grantReadWriteData(this.predictAsyncLambda);
    table.grantReadWriteData(this.deadLetterLambda);

    // Grant read access to the speech secret for the predictAsyncLambda and voiceLambda
    speechSecret?.grantRead(this.predictAsyncLambda);

    // Grant read/write access to the S3 bucket for the voiceLambda and predictAsyncLambda
    bucket.grantReadWrite(this.predictAsyncLambda, 'audio/*');

    // Trigger the predictAsyncLambda when a message is sent to the SQS queue
    this.predictAsyncLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(this.queue)
    );

    // Trigger the deadLetterLambda when a message is sent to the deadLetterQueue
    this.deadLetterLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(this.deadLetterQueue)
    );
  }
}
