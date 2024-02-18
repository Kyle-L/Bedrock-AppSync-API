import { Context, SQSEvent } from 'aws-lambda';
import { updateThreadStatus } from 'lib/utils/dynamodb';
import { MessageSystemStatus } from 'lib/utils/types';

// Environment variables
const { TABLE_NAME = '' } = process.env;

export async function handler({ Records }: SQSEvent, _context: Context) {
  console.debug('Received event:', JSON.stringify(Records, null, 2));

  if (!Records || Records.length === 0) {
    throw new Error('No records found in the event. Aborting operation.');
  }

  return Promise.all(
    Records.map(async ({ body }) => {
      const { id, threadId } = JSON.parse(body);

      return updateThreadStatus({
        id,
        threadId,
        status: MessageSystemStatus.ERROR,
        tableName: TABLE_NAME
      });
    })
  );
}
