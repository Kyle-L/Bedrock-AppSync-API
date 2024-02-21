import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { sqsClient } from 'lib/utils/clients';
import { updateThreadStatus } from 'lib/utils/dynamodb';
import { MessageSystemStatus } from 'lib/utils/types';

// Environment variables
const { QUEUE_URL = '', TABLE_NAME = '' } = process.env;

export async function handler(
  event: AppSyncResolverEvent<{
    input: { prompt: string; threadId: string };
  }>
) {
  console.debug('Received event:', JSON.stringify(event, null, 2));

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
    // Inserts the user's request into the queue, and peforms the DynamoDB update in parallel.
    await Promise.all([
      updateThreadStatus({
        userId: id,
        threadId,
        status: MessageSystemStatus.PENDING,
        tableName: TABLE_NAME
      }),
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
