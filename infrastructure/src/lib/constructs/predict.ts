import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import path = require('path');
import * as sqs from 'aws-cdk-lib/aws-sqs';

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

    // A conversation history table
    // SQS Queue
    this.queue = new cdk.aws_sqs.Queue(this, 'ConversationQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    // Queue Lambda
    this.queueLambda = new NodejsFunction(this, 'PredictAsyncQueueLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../assets/lambdas/queue-trigger/index.ts'),
      environment: {
        QUEUE_URL: this.queue.queueUrl,
        TABLE_NAME: props.conversationHistoryTable.tableName
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(30),
      initialPolicy: [
        // Allow the lambda to call SQS
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sqs:*'],
          resources: [this.queue.queueArn]
        })
      ]
    });

    // Grants the lambda permission to write/read to/from the DynamoDB table.
    props.conversationHistoryTable.grantReadWriteData(this.queueLambda);

    this.predictAsyncLambda = new NodejsFunction(this, 'PredictAsyncLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../assets/lambdas/predict-async/index.ts'),
      environment: {
        GRAPHQL_URL: props.appSyncApi.graphqlUrl
      },
      bundling: {
        nodeModules: ['langchain'],
        minify: true,
        sourceMap: true
      },
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

    // Trigger the AI Lambda when a message is sent to the SQS queue.
    this.predictAsyncLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(this.queue)
    );
  }
}
