import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamodbClient } from './clients';
import { MessageSystemStatus } from './types';

export async function updateThreadStatus({
  id,
  threadId,
  status,
  tableName
}: {
  id: string;
  threadId: string;
  status: MessageSystemStatus;
  tableName: string;
}) {
  return await dynamodbClient.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { pk: { S: `USER#${id}` }, sk: { S: `THREAD#${threadId}` } },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status }
      }
    })
  );
}

export async function addMessage({
  id,
  threadId,
  message,
  audioClips,
  sender,
  tableName
}: {
  id: string;
  threadId: string;
  message: string;
  audioClips?: string[];
  sender: string;
  tableName: string;
}) {
  await dynamodbClient.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { pk: { S: `USER#${id}` }, sk: { S: `THREAD#${threadId}` } },
      UpdateExpression:
        'SET #messages = list_append(if_not_exists(#messages, :empty_list), :messages)',
      ExpressionAttributeNames: {
        '#messages': 'messages'
      },
      ExpressionAttributeValues: {
        ':messages': {
          L: [
            {
              M: {
                sender: { S: sender },
                message: { S: message },
                audioClips: {
                  L: (audioClips || []).map((clip) => ({ S: clip }))
                },
                createdAt: { S: new Date().toISOString() }
              }
            }
          ]
        },
        ':empty_list': { L: [] }
      }
    })
  );
}
