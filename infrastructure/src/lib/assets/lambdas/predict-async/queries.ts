import { AppSyncRequestIAM } from 'lib/assets/utils/appsync';

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
export const sendRequest = async (
  query: string,
  variables: { [key: string]: string | { sender: string; message: string } }
) => {
  if (!config.url) {
    throw new Error('GRAPHQL_URL is missing. Aborting operation.');
  }

  return await AppSyncRequestIAM({
    config,
    operation: { query, operationName: 'Mutation', variables }
  });
};

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
