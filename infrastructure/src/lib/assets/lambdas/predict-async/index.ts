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

async function processChunk(
  userId: string,
  threadId: string,
  chunk: string,
  status = 'PROCESSING'
) {
  console.log(`Received Chunk: ${chunk}`);
  await sendRequest(sendMessageChunkMutation, {
    userId,
    threadId,
    status,
    data: chunk
  });
}

async function updateMessageSystemStatus(
  userId: string,
  threadId: string,
  status: string,
  message: { sender: string; text: string }
) {
  return sendRequest(addMessageSystemMutation, {
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
async function completeProcessing(
  userId: string,
  threadId: string,
  eventResult: { sender: string; text: string }
) {
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
async function processEvent(
  userId: string,
  threadId: string,
  history: string,
  userPrompt: string,
  eventTimeout: number
) {
  const fullPrompt = `${history}\n\nHuman: ${userPrompt}\n\nAssistant: `;
  let eventResult = '';

  const timeoutTask = createTimeoutTask(eventTimeout);

  const processingTask = new Promise(async (resolve) => {
    await updateMessageSystemStatus(userId, threadId, 'PROCESSING', {
      sender: 'Human',
      text: userPrompt
    });

    console.log(`Processing prompt: ${fullPrompt}`);

    await processAsynchronously(fullPrompt, async (chunk) => {
      eventResult += chunk;
      await processChunk(userId, threadId, chunk);
    });

    resolve({ statusCode: 200, message: 'Success!' });
  });

  const res = await Promise.race([processingTask, timeoutTask]);

  await completeProcessing(userId, threadId, { sender: 'Assistant', text: eventResult });

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
    const history = (eventData.prev.result.data || [])
      .map((message: { sender: string; text: string }) => {
        return `${message.sender}: ${message.text}`;
      })
      .join('\n\n');
    const threadHistory = `${systemPrompt}${history}`;
    const userPrompt = eventData.arguments.prompt;

    console.log(`Received Event: ${JSON.stringify(eventData)}`);
    return processEvent(userId, threadId, threadHistory, userPrompt, adjustedTimeout);
  });

  return Promise.all(processingTasks);
}
