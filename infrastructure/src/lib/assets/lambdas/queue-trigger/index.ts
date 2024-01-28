import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { MessageSystemStatus } from 'lib/assets/utils/types';

// Environment variables
const { QUEUE_URL = '', TABLE_NAME = '' } = process.env;

// Clients
const sqsClient = new SQSClient();
const dynamodb = new DynamoDBClient();

export async function handler(
  event: AppSyncResolverEvent<{
    input: { prompt: string; threadId: string };
  }>
) {
  const {
    identity,
    prev,
    arguments: {
      input: { prompt }
    }
  } = event;

  // Condition 1: User is authenticated. If not, throw an error.
  if (!(identity as AppSyncIdentityCognito)?.sub) {
    throw new Error('Missing identity');
  }
  const id = (identity as AppSyncIdentityCognito).sub;

  // Condition 2: The thread is not currently processing. If it is, throw an error.
  if (
    !id ||
    (prev?.result?.status &&
      [MessageSystemStatus.PENDING, MessageSystemStatus.PROCESSING].includes(
        prev.result.status
      ))
  ) {
    throw new Error('Thread is currently processing');
  }

  // Condition 3: The thread ID is missing.
  let threadId = prev?.result?.sk;
  if (!threadId) throw new Error('That thread does not exist');
  threadId = threadId.split('#')[1];

  try {
    // The command to set thread's status to PENDING to block other requests from processing.
    const dynamoParams = {
      TableName: TABLE_NAME,
      Key: { pk: { S: `USER#${id}` }, sk: { S: `THREAD#${threadId}` } },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': { S: MessageSystemStatus.PENDING }
      }
    };

    // Inserts the user's request into the queue, and peforms the DynamoDB update in parallel.
    await Promise.all([
      dynamodb.send(new UpdateItemCommand(dynamoParams)),
      sqsClient.send(
        new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(event)
        })
      )
    ]);

    return {
      message: {
        sender: 'User',
        message: prompt,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error('An error occurred');
  }
}
