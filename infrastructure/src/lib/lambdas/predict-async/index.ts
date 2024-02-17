import { Context, SQSEvent } from 'aws-lambda';
import { processAsynchronously } from 'lib/utils/ai/bedrock-utils';
import { synthesizeSpeechAndUploadAudio } from 'lib/utils/voice';
import { EventResult, EventType, MessageSystemStatus } from '../../utils/types';
import {
  sendChunk,
  updateMessageSystemStatus as createMessage
} from './queries';
import { createTimeoutTask } from 'lib/utils/time/timeout-task';
import { getCompleteSentence } from 'lib/utils/text/sentence-extractor';
import { PromiseQueue } from 'lib/utils/structures/queue';

// Constants
const EVENT_TIMEOUT_BUFFER = 5000; // 5 second

// Environment variables
const { S3_BUCKET = '', SPEECH_SECRET = '' } = process.env;

/**
 * Completes the processing of an event by updating the thread's status to COMPLETE and adding the AI's response to the thread's message history.
 * @param userId The user ID.
 * @param threadId The thread ID.
 * @param eventResult The AI's response.
 */
async function completePrediction(
  userId: string,
  threadId: string,
  eventResult: EventResult
) {
  await Promise.all([
    // Update the thread's status to COMPLETE and add the AI's response to the thread's message history.
    createMessage(userId, threadId, MessageSystemStatus.COMPLETE, eventResult),

    // Send an empty chunk to indicate that the processing is complete.
    sendChunk({
      userId,
      threadId,
      chunk: eventResult.message,
      status: MessageSystemStatus.COMPLETE
    })
  ]);
}

/**
 * Processes a single event.
 * @param userId {string} The user ID.
 * @param threadId {string} The thread ID.
 * @param userPrompt {string} The full prompt to process. This includes the thread's system prompt, message history, user's prompt, and start of the AI's response.
 * @param eventTimeout {number} The timeout for the event.
 * @returns {Promise<{ statusCode: number; message: string }>} The result of the event.
 */
async function processSingleEvent({
  userId,
  threadId,
  history,
  query,
  eventTimeout,
  persona,
  responseOptions
}: EventType) {
  const formattedHistory = [...history, { sender: 'User', message: query }]
    .map((message) => {
      return `${message.sender}: ${message.message}`;
    })
    .join('\n')
    .trim();

  const fullQuery = `${formattedHistory}\nAssistant: `;

  let res = { statusCode: 200, message: 'Success!' };
  let fullResponse = '';
  let lastSentenceResponse = '';

  // Queues
  const audioPromiseQueue = new PromiseQueue();

  const timeoutTask = createTimeoutTask(eventTimeout);

  try {
    const processingTask = new Promise<{ statusCode: number; message: string }>(
      async (resolve) => {
        console.log(`Processing prompt: ${fullQuery}`);

        await createMessage(userId, threadId, MessageSystemStatus.PROCESSING, {
          sender: 'User',
          message: query
        }),
          await processAsynchronously({
            query,
            fullQuery,
            promptTemplate: persona.prompt,
            model: persona.model,
            knowledgeBaseId: persona.knowledgeBaseId,
            callback: async (chunk) => {
              try {
                fullResponse += chunk;
                lastSentenceResponse += chunk;

                const { sentence, remainingText, containsComplete } =
                  getCompleteSentence(lastSentenceResponse);

                lastSentenceResponse = containsComplete
                  ? remainingText
                  : sentence;

                console.log(`Received Text Chunk: ${chunk}`);
                await sendChunk({
                  userId,
                  threadId,
                  chunk: fullResponse,
                  chunkType: 'text'
                });

                if (responseOptions.includeAudio && containsComplete) {
                  console.log(`Received Audio Chunk: ${sentence}`);
                  audioPromiseQueue.enqueue(
                    new Promise(async (resolve) => {
                      console.log(`Synthesizing audio for: ${sentence}`);
                      const audio = await synthesizeSpeechAndUploadAudio({
                        voice: persona.voice,
                        audioText: sentence,
                        bucket: S3_BUCKET,
                        speechSecretArn: SPEECH_SECRET
                      });
                      console.log(`Audio synthesized for: ${sentence}`);
                      resolve(audio);
                    }),
                    async (audio) => {
                      console.log(`Sending audio chunk for: ${sentence}`);
                      await sendChunk({
                        userId,
                        threadId,
                        chunk: audio,
                        chunkType: 'audio'
                      });
                    }
                  );
                }
              } catch (err) {
                console.error(
                  'An error occurred while processing the chunk:',
                  err
                );
                await sendChunk({
                  userId,
                  threadId,
                  chunk: 'An error occurred while processing the prompt.',
                  chunkType: 'error'
                });
              }
            }
          });

        await audioPromiseQueue.awaitAll();

        resolve({ statusCode: 200, message: 'Success!' });
      }
    );

    res = await Promise.race([processingTask, timeoutTask]);
  } catch (err) {
    console.error('An error occurred while processing the prompt:', err);
    fullResponse = 'An error occurred while processing the prompt.';
    res = {
      statusCode: 500,
      message: 'An error occurred while processing the prompt.'
    };
  }

  await completePrediction(userId, threadId, {
    sender: 'Assistant',
    message: fullResponse
  });

  return res;
}

/**
 * Processes a batch of events.
 * @param event SQS event containing the batch of events to process.
 * @returns The results of the events.
 */
export async function handler(event: SQSEvent, context: Context) {
  if (!event.Records || event.Records.length === 0) {
    throw new Error('No records found in the event. Aborting operation.');
  }

  // Each event gets a timeout of the remaining time divided by the number of events, this way
  // we can ensure that we don't exceed the timeout for the lambda.
  const eventTimeout =
    (context.getRemainingTimeInMillis() - EVENT_TIMEOUT_BUFFER) /
    event.Records.length;

  const processingTasks = event.Records.map(async (record) => {
    const eventData = JSON.parse(record.body);

    console.log(`Received Event: ${JSON.stringify(eventData)}`);
    return processSingleEvent({
      userId: eventData.identity.sub,
      threadId: eventData.arguments.input.threadId,
      history: eventData.prev.result.messages || [],
      query: eventData.arguments.input.prompt,
      eventTimeout: eventTimeout,
      persona: eventData.prev.result.persona,
      responseOptions: {
        includeAudio: eventData.arguments.input.includeAudio
      }
    });
  });

  return Promise.all(processingTasks);
}
