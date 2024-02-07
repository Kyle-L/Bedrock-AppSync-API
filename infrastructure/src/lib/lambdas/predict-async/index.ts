import { Context, SQSEvent } from 'aws-lambda';
import { processAsynchronously } from 'lib/utils/ai/bedrock-utils';
import { synthesizeSpeechAndUploadAudio } from 'lib/utils/voice';
import { EventResult, EventType, MessageSystemStatus } from '../../utils/types';
import { sendChunk, updateMessageSystemStatus } from './queries';
import { createTimeoutTask } from 'lib/utils/time/timeout-task';
import { getCompleteSentence } from 'lib/utils/text/sentence-extractor';

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
  const result = await Promise.all([
    // Update the thread's status to COMPLETE and add the AI's response to the thread's message history.
    updateMessageSystemStatus(
      userId,
      threadId,
      MessageSystemStatus.COMPLETE,
      eventResult
    ),

    // Send an empty chunk to indicate that the processing is complete.
    sendChunk({
      userId,
      threadId,
      chunk: '',
      status: MessageSystemStatus.COMPLETE
    })
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
async function processSingleEvent({
  userId,
  threadId,
  history,
  query,
  eventTimeout,
  persona,
  responseOptions
}: EventType) {
  const formattedHistory = history
    .map((message) => {
      return `${message.sender}: ${message.message}`;
    })
    .join('\n\n')
    .trim();

  const fullQuery = `${formattedHistory}\n\nUser: ${query}\n\Assistant: `;
  let fullResponse = '';
  let lastSentenceResponse = '';

  const timeoutTask = createTimeoutTask(eventTimeout);

  const processingTask = new Promise(async (resolve) => {
    console.log(`Processing prompt: ${fullQuery}`);

    try {
      await Promise.all([
        // Adds the user's prompt to the thread's message history and updates the thread's status to PROCESSING.
        await updateMessageSystemStatus(
          userId,
          threadId,
          MessageSystemStatus.PROCESSING,
          {
            sender: 'User',
            message: query
          }
        ),

        // Kicks off the asynchronous processing of the prompt.
        await processAsynchronously({
          query,
          fullQuery,
          promptTemplate: persona.prompt,
          callback: async (chunk) => {
            try {
              console.log(`Received Text Chunk: ${chunk}`);
              await sendChunk({
                userId,
                threadId,
                chunk: chunk,
                chunkType: 'text'
              });

              fullResponse += chunk;
              lastSentenceResponse += chunk;

              if (responseOptions.includeAudio && lastSentenceResponse.trim()) {
                const { sentence, remainingText, containsComplete } =
                  getCompleteSentence(lastSentenceResponse);
                if (containsComplete) {
                  lastSentenceResponse = remainingText;

                  console.log(`Received Audio Chunk: ${lastSentenceResponse}`);
                  const audio = await synthesizeSpeechAndUploadAudio({
                    voice: persona.voice,
                    audioText: sentence,
                    bucket: S3_BUCKET,
                    speechSecretArn: SPEECH_SECRET
                  });

                  await sendChunk({
                    userId,
                    threadId,
                    chunk: audio,
                    chunkType: 'audio'
                  });
                }
              }
            } catch (err) {
              console.error(err);
              await sendChunk({
                userId,
                threadId,
                chunk: 'An error occurred while processing the prompt.',
                chunkType: 'error'
              });
            }
          },
          model: persona.model,
          knowledgeBaseId: persona.knowledgeBaseId
        })
      ]);
    } catch (err) {
      console.error(err);
      fullResponse = 'An error occurred while processing the prompt.';
    }

    resolve({ statusCode: 200, message: 'Success!' });
  });

  const res = await Promise.race([processingTask, timeoutTask]);

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
