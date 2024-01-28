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
  chunkType,
  chunk
}: {
  userId: string;
  threadId: string;
  status?: MessageSystemStatus;
  chunkType?: 'text' | 'audio';
  chunk: string;
}) {
  status = status || MessageSystemStatus.PROCESSING;
  chunkType = chunkType || 'text';

  const result = (await sendRequest(sendMessageChunkMutation, {
    userId,
    threadId,
    status,
    chunkType,
    chunk
  })) as { errors?: any[]; data?: any };

  if (result.errors) {
    console.error(
      'Error occurred while sending message chunk:',
      JSON.stringify(result.errors)
    );
  } else {
    console.log(
      'Successfully sent message chunk:',
      JSON.stringify(result.data)
    );
  }
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
  const result = (await sendRequest(addMessageSystemMutation, {
    userId,
    threadId,
    status,
    message
  })) as { errors?: any[]; data?: any };

  if (result.errors) {
    console.error(
      'Error occurred while updating thread status:',
      JSON.stringify(result.errors)
    );
  } else {
    console.log(
      'Successfully updated thread status:',
      JSON.stringify(result.data)
    );
  }
}

/**
 * Sends a request to update the thread's status and add the AI's response to the thread's message history.
 */
export const addMessageSystemMutation = `mutation Mutation($userId: ID!, $threadId: ID!, $status: ThreadStatus!, $message: MessageInput!) {
  systemAddMessage(input: {userId: $userId, threadId: $threadId, status: $status, message: $message}) {
      message {
          sender
          message
      }
  }
}`;

/**
 * Sends a chunk to the all subscribers of the thread providing the thread's status, the chunk's order, type, and content.
 */
export const sendMessageChunkMutation = `mutation Mutation($userId: ID!, $threadId: ID!, $status: ThreadStatus!, $chunkType: String!, $chunk: String!) {
  systemSendMessageChunk(input: {userId: $userId, threadId: $threadId, status: $status, chunkType: $chunkType, chunk: $chunk}) {
        status
        userId
        threadId
        chunkType
        chunk
  }
}`;
