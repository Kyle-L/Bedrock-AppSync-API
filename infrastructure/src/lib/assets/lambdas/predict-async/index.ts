import { SQSEvent } from 'aws-lambda';
import { processAsynchronously } from 'lib/assets/utils/ai';
import { addMessageSystemMutation, sendMessageChunkMutation, sendRequest } from './queries';

const EVENT_TIMEOUT = 25000;

/**
 * A timeout task that resolves after a specified timeout.
 * @param timeout {number} The timeout in milliseconds.
 * @returns {Promise<{ statusCode: number; message: string }>} The result of the timeout task.
 */
async function createTimeoutTask(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ statusCode: 504, message: 'Task timed out!' }), timeout);
  });
}

async function processChunk(userId: string, threadId: string, chunk: string, status = 'PROCESSING') {
  console.log(`Received Chunk: ${chunk}`);
  await sendRequest(sendMessageChunkMutation, {
    userId,
    threadId,
    status,
    data: chunk
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
async function updateMessageSystemStatus(
  userId: string,
  threadId: string,
  status: 'PEMNDING' | 'NEW' | 'PROCESSING' | 'COMPLETE',
  message: { sender: string; text: string }
) {
  await sendRequest(addMessageSystemMutation, {
    userId,
    threadId,
    status,
    message
  });
}

/**
 * Completes the processing of an event by updating the thread's status to COMPLETE and adding the AI's response to the thread's message history.
 * @param userId {string} The user ID.
 * @param threadId {string} The thread ID.
 * @param eventResult {Promise<void>}
 */
async function completeProcessing(userId: string, threadId: string, eventResult: { sender: string; text: string }) {
  const result = await Promise.all([
    // Update the thread's status to COMPLETE and add the AI's response to the thread's message history.
    updateMessageSystemStatus(userId, threadId, 'COMPLETE', eventResult),

    // Send an empty chunk to indicate that the processing is complete.
    processChunk(userId, threadId, '', 'COMPLETE')
  ]);

  console.log('Result:', JSON.stringify(result));
}

/**
 * Processes a single event.
 * @param userId {string} The user ID.
 * @param threadId {string} The thread ID.
 * @param userPrompt {string} The full prompt to process. This includes the thread's system prompt, message history, user's prompt, and start of the AI's response.
 * @param eventTimeout {number} The timeout for the event.
 * @returns {Promise<{ statusCode: number; message: string }>} The result of the event.
 */
async function processEvent({
  userId,
  threadId,
  history,
  userPrompt,
  eventTimeout,
  model
}: {
  userId: string;
  threadId: string;
  history: string;
  userPrompt: string;
  eventTimeout: number;
  model: 'ai21' | 'claude';
}) {
  const fullPrompt = `${history}\n\nUser: ${userPrompt}\n\nBot: `;
  let eventResult = '';

  const timeoutTask = createTimeoutTask(eventTimeout);

  const processingTask = new Promise(async (resolve) => {
    await updateMessageSystemStatus(userId, threadId, 'PROCESSING', {
      sender: 'User',
      text: userPrompt
    });

    console.log(`Processing prompt: ${fullPrompt}`);

    try {
      await processAsynchronously({
        prompt: fullPrompt,
        callback: async (chunk) => {
          await processChunk(userId, threadId, chunk);
          eventResult += chunk;
        },
        model: model as 'ai21' | 'claude'
      });
    } catch (err) {
      console.error(err);
      eventResult = 'An error occurred while processing the prompt.';
    }

    resolve({ statusCode: 200, message: 'Success!' });
  });

  const res = await Promise.race([processingTask, timeoutTask]);

  await completeProcessing(userId, threadId, { sender: 'Bot', text: eventResult });

  return res;
}

/**
 * Processes a batch of events.
 * @param event {SQSEvent} SQS event containing the batch of events to process.
 * @returns {Promise<{ statusCode: number; message: string }[]>} The results of the events.
 */
export async function handler(event: SQSEvent) {
  if (!event.Records || event.Records.length === 0) {
    throw new Error('No records found in the event. Aborting operation.');
  }

  const numberOfEvents = event.Records.length;
  const adjustedTimeout = EVENT_TIMEOUT / numberOfEvents;

  const processingTasks = event.Records.map(async (record) => {
    const eventData = JSON.parse(record.body);

    const userId = eventData.identity.sub;
    const threadId = eventData.arguments.threadId;
    const systemPrompt = eventData.prev.result.persona.prompt;
    const personaModel = eventData.prev.result.persona.model;
    const history = (eventData.prev.result.data || [])
      .map((message: { sender: string; text: string }) => {
        return `${message.sender}: ${message.text}`;
      })
      .join('\n\n');
    const threadHistory = `${systemPrompt}${history}`;
    const userPrompt = eventData.arguments.prompt;

    console.log(`Received Event: ${JSON.stringify(eventData)}`);
    return processEvent({
      userId,
      threadId,
      history: threadHistory,
      userPrompt,
      eventTimeout: adjustedTimeout,
      model: personaModel
    });
  });

  return Promise.all(processingTasks);
}
