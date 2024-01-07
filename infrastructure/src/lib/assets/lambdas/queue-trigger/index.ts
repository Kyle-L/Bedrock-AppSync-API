import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { AppSyncIdentityCognito, AppSyncResolverEvent, Handler } from 'aws-lambda';

const QUEUE_URL = process.env.QUEUE_URL || '';
const TABLE_NAME = process.env.TABLE_NAME || '';

const sqsClient = new SQSClient();
const dynamodb = new DynamoDBClient();

interface EventArguments {
  [key: string]: string;
}

interface Event
  extends AppSyncResolverEvent<{
    arguments: EventArguments;
    [key: string]: string | EventArguments;
  }> {}

export const handler: Handler = async (event: Event) => {
  console.log('Received Event:', event);

  // Condition 1: User is authenticated. If not, throw an error.
  if (!(event.identity as AppSyncIdentityCognito)?.sub) {
    throw new Error('Missing identity');
  }
  const id = (event.identity as AppSyncIdentityCognito).sub;

  // Condition 2: The thread is not currently processing. If it is, throw an error.
  if (event.prev?.result?.status && event.prev.result.status !== 'NEW' && event.prev.result.status !== 'COMPLETE') {
    throw new Error('Thread is currently processing');
  }

  // Condition 3: The thread ID is missing. If it is, generate a new one.
  const threadId = event.prev?.result?.sk;
  if (!threadId) {
    throw new Error('That thread does not exist');
  }
  event.arguments.threadId = threadId.split('#')[1];

  try {
    const dynamoParams = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: `USER#${id}` },
        sk: { S: `THREAD#${event.arguments.threadId}` }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: 'PENDING' }
      }
    };

    console.log('DynamoDB Parameters:', dynamoParams);

    // Perform DynamoDB update asynchronously
    const dynamoPromise = dynamodb.send(new UpdateItemCommand(dynamoParams));

    const sqsParams: SendMessageCommandInput = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(event)
    };
    console.log('SQS Parameters:', sqsParams);

    // Perform SQS send asynchronously
    const sqsPromise = sqsClient.send(new SendMessageCommand(sqsParams));

    // Wait for Assistanth DynamoDB and SQS operations to complete
    await Promise.all([dynamoPromise, sqsPromise]);

    console.log('DynamoDB and SQS operations completed successfully');
    return { sender: 'User', text: event.arguments.prompt };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred');
  }
};
