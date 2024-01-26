import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Context, SQSEvent } from 'aws-lambda';
import { processAsynchronously } from 'lib/assets/utils/ai/bedrock-utils';
import {
  getAzureSpeechSecret,
  synthesizeAndUploadAudio
} from 'lib/assets/utils/voice';
import { SpeechConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { EventResult, EventType, MessageSystemStatus } from '../../utils/types';
import { sendChunk, updateMessageSystemStatus } from './queries';

// Constants
const EVENT_TIMEOUT_BUFFER = 5000; // 5 second

// Environment variables
const BUCKET = process.env.S3_BUCKET || '';
const AZURE_SPEECH_SECRET = process.env.AZURE_SPEECH_SECRET || '';

// Clients
const s3Client = new S3Client();

/**
 * A timeout task that resolves after a specified timeout.
 * @param timeout The timeout in milliseconds.
 * @returns The result of the timeout task.
 */
async function createTimeoutTask(
  timeout: number
): Promise<{ statusCode: number; message: string }> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ statusCode: 504, message: 'Task timed out!' }),
      timeout
    );
  });
}

/**
 * Completes the processing of an event by updating the thread's status to COMPLETE and adding the AI's response to the thread's message history.
 * @param userId The user ID.
 * @param threadId The thread ID.
 * @param eventResult The AI's response.
 */
async function completeProcessing(
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
async function processEvent({
  userId,
  threadId,
  history,
  query,
  eventTimeout,
  persona,
  responseOptions
}: EventType) {
  const fullQuery = `${history}\n\nUser: ${query}\n\Assistant: `;
  let fullResponse = '';
  let lastSentenceResponse = '';

  const timeoutTask = createTimeoutTask(eventTimeout);

  // Sets up Azure Speech Config
  const { speechKey, speechRegion } =
    await getAzureSpeechSecret(AZURE_SPEECH_SECRET);
  const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);

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
          query: fullQuery,
          promptTemplate: persona.prompt,
          callback: async (chunk) => {
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
              const { sentence, remainingText, isComplete } =
                getCompleteSentence(lastSentenceResponse);
              if (isComplete) {
                lastSentenceResponse = remainingText;

                console.log(`Received Audio Chunk: ${lastSentenceResponse}`);
                const audio = await synthesizeAndUploadAudio({
                  voice: persona.voice,
                  audioText: sentence,
                  bucket: BUCKET,
                  speechConfig
                });

                await sendChunk({
                  userId,
                  threadId,
                  chunk: audio,
                  chunkType: 'audio'
                });
              }
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

  await completeProcessing(userId, threadId, {
    sender: 'Assistant',
    message: fullResponse
  });

  return res;
}

function getCompleteSentence(text: string): {
  sentence: string;
  remainingText: string;
  isComplete: boolean;
} {
  const sentenceEndIndex = text.search(/[\.\?\!]/);
  if (sentenceEndIndex === -1) {
    return { sentence: text, remainingText: '', isComplete: false };
  }
  const sentence = text.substring(0, sentenceEndIndex + 1);
  const remainingText = text.substring(sentenceEndIndex + 2);
  return { sentence, remainingText, isComplete: true };
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

    const history = (eventData.prev.result.data || [])
      .map((message: { sender: string; text: string }) => {
        return `${message.sender}: ${message.text}`;
      })
      .join('\n\n');

    console.log(`Received Event: ${JSON.stringify(eventData)}`);
    return processEvent({
      userId: eventData.identity.sub,
      threadId: eventData.arguments.input.threadId,
      history,
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
