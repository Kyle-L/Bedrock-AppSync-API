import { AppSyncRequestIAM } from 'lib/assets/utils/appsync';

const config = {
  url: process.env.GRAPHQL_URL || '',
  region: process.env.REGION || 'us-east-2'
};

/**
 * A helper function for sending a request to AppSync.
 * @param query {string} - The GraphQL query
 * @param variables {object} - The GraphQL variables { [key: string]: string
 * @returns {Promise<any>}
 */
export const sendRequest = async (
  query: string,
  variables: { [key: string]: string | { sender: string; text: string } }
) => {
  if (!config.url) {
    console.error('GRAPHQL_URL is missing. Aborting operation.');
    return;
  }

  return await AppSyncRequestIAM({
    config,
    operation: { query, operationName: 'Mutation', variables }
  });
};

export const addMessageSystemMutation = `mutation Mutation($userId: String!, $threadId: String!, $status: Status!, $message: MessageInput!) {
  addMessageSystem(userId: $userId, threadId: $threadId, status: $status, message: $message) {
      userId
      threadId
      status
  }
}`;

export const sendMessageChunkMutation = `mutation Mutation($userId: String!, $threadId: String!, $status: Status!, $data: String!) {
    sendMessageChunk(userId: $userId, threadId: $threadId, status: $status, data: $data) {
        userId
        threadId
        status
        data
    }
}`;
