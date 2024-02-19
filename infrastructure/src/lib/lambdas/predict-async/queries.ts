import { AppSyncRequestIAM } from 'lib/utils/appsync';
import { MessageSystemStatus } from 'lib/utils/types';
import { GRAPHQL_URL, REGION } from './config';

/**
 * Sends a chunk to the all subscribers of the thread providing the thread's status, the chunk's order, type, and content.
 */
const sendMessageChunkMutation = `mutation Mutation($userId: ID!, $threadId: ID!, $status: ThreadStatus!, $chunkType: String!, $chunk: String!) {
  systemSendMessageChunk(input: {userId: $userId, threadId: $threadId, status: $status, chunkType: $chunkType, chunk: $chunk}) {
        status
        userId
        threadId
        chunkType
        chunk
  }
}`;

/**
 * A helper function for sending a request to AppSync.
 * @param query {string} - The GraphQL query
 * @param variables {object} - The GraphQL variables { [key: string]: string
 * @returns {Promise<any>}
 */
async function sendRequest(
  query: string,
  variables: { [key: string]: any }
): Promise<any> {
  if (!GRAPHQL_URL) {
    throw new Error('GRAPHQL_URL is missing. Aborting operation.');
  }

  return await AppSyncRequestIAM({
    config: {
      url: GRAPHQL_URL,
      region: REGION
    },
    operation: { query, operationName: 'Mutation', variables }
  });
}

export async function sendChunk({
  userId,
  threadId,
  status,
  chunkType,
  chunk
}: {
  userId: string;
  threadId: string;
  status?: MessageSystemStatus;
  chunkType?: 'text' | 'audio' | 'image' | 'error' | 'status';
  chunk?: string;
}) {
  status = status || MessageSystemStatus.PROCESSING;
  chunkType = chunkType || 'text';
  chunk = chunk || '';

  return (await sendRequest(sendMessageChunkMutation, {
    userId,
    threadId,
    status,
    chunkType,
    chunk
  })) as { errors?: any[]; data?: any };
}
