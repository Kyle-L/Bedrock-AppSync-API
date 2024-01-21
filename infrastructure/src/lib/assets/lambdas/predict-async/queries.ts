import { AppSyncRequestIAM } from 'lib/assets/utils/appsync';
import { MessageSystemStatus } from 'lib/assets/utils/types';

const config = {
  url: process.env.GRAPHQL_URL || '',
  region: process.env.REGION || 'us-east-1'
};

/**
 * A helper function for sending a request to AppSync.
 * @param query {string} - The GraphQL query
 * @param variables {object} - The GraphQL variables { [key: string]: string
 * @returns {Promise<any>}
 */
const sendRequest = async (
  query: string,
  variables: { [key: string]: any }
) => {
  if (!config.url) {
    throw new Error('GRAPHQL_URL is missing. Aborting operation.');
  }

  return await AppSyncRequestIAM({
    config,
    operation: { query, operationName: 'Mutation', variables }
  });
};

export async function sendChunk({
  userId,
  threadId,
  status,

  chunkOrder,
  chunkType,
  chunk
}: {
  userId: string;
  threadId: string;
  status?: MessageSystemStatus;

  chunkOrder?: number;
  chunkType?: 'text' | 'audio';
  chunk: string;
}) {
  status = status || MessageSystemStatus.PROCESSING;
  chunkOrder = chunkOrder || 0;
  chunkType = chunkType || 'text';

  await sendRequest(sendMessageChunkMutation, {
    userId,
    threadId,
    status,

    chunkOrder,
    chunkType,
    chunk
  });
}

/**
 * Sends a request to update the thread's status and add the AI's response to the thread's message history.
 * @param userId {string} The user ID.
 * @param threadId {string} The thread ID.
 * @param status {string} The thread's status.
 * @param message {string} The AI's response.
 * @returns {Promise<unknown>} The result of the request from the GraphQL API.
 */
export async function updateMessageSystemStatus(
  userId: string,
  threadId: string,
  status: MessageSystemStatus,
  message: { sender: string; message: string }
) {
  return await sendRequest(addMessageSystemMutation, {
    userId,
    threadId,
    status,
    message
  });
}

export const addMessageSystemMutation = `mutation Mutation($userId: ID!, $threadId: ID!, $status: ThreadStatus!, $message: MessageInput!) {
  systemAddMessage(input: {userId: $userId, threadId: $threadId, status: $status, message: $message}) {
      message {
          sender
          message
      }
  }
}`;

export const sendMessageChunkMutation = `mutation Mutation($userId: ID!, $threadId: ID!, $status: ThreadStatus!, $chunkOrder: Int!, $chunkType: ChunkType!, $chunk: String!) {
  systemSendMessageChunk(input: {userId: $userId, threadId: $threadId, status: $status, chunkOrder: $chunkOrder, chunkType: $chunkType, chunk: $chunk}) {
        status
        userId
        threadId

        chunkOrder
        chunkType
        chunk
  }
}`;
