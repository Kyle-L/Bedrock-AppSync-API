import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput
} from '@aws-sdk/client-sqs';
import {
  AppSyncIdentityCognito,
  AppSyncResolverEvent,
  Handler
} from 'aws-lambda';
import { MessageSystemStatus } from 'lib/assets/utils/types';

// Environment variables
const QUEUE_URL = process.env.QUEUE_URL || '';
const TABLE_NAME = process.env.TABLE_NAME || '';

// Clients
const sqsClient = new SQSClient();
const dynamodb = new DynamoDBClient();

export const handler: Handler = async (
  event: AppSyncResolverEvent<{
    input: {
      prompt: string;
      threadId: string;
    };
  }>
) => {
  console.log('Received Event:', event);

  // Condition 1: User is authenticated. If not, throw an error.
  if (!(event.identity as AppSyncIdentityCognito)?.sub) {
    throw new Error('Missing identity');
  }
  const id = (event.identity as AppSyncIdentityCognito).sub;

  // Condition 2: The thread is not currently processing. If it is, throw an error.
  if (
    event.prev?.result?.status &&
    event.prev.result.status == MessageSystemStatus.PENDING &&
    event.prev.result.status == MessageSystemStatus.PROCESSING
  ) {
    throw new Error('Thread is currently processing');
  }

  // Condition 3: The thread ID is missing.
  let threadId = event.prev?.result?.sk;
  if (!threadId) {
    throw new Error('That thread does not exist');
  }
  threadId = threadId.split('#')[1];

  try {
    const dynamoParams = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: `USER#${id}` },
        sk: { S: `THREAD#${threadId}` }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: MessageSystemStatus.PENDING }
      }
    };

    // Perform DynamoDB update asynchronously
    const dynamoPromise = dynamodb.send(new UpdateItemCommand(dynamoParams));

    // Perform SQS send asynchronously
    const sqsPromise = sqsClient.send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(event)
      })
    );

    // Wait for Assistanth DynamoDB and SQS operations to complete
    await Promise.all([dynamoPromise, sqsPromise]);

    console.log('DynamoDB and SQS operations completed successfully');
    return {
      message: {
        sender: 'User',
        message: event.arguments.input.prompt,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred');
  }
};
