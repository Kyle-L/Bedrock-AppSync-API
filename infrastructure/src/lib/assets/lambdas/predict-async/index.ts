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
  let eventResult = '';
  let lastSentence = '';
  const audioJobs: Promise<void>[] = [];

  const timeoutTask = createTimeoutTask(eventTimeout);

  // Sets up Azure Speech Config
  const { speechKey, speechRegion } =
    await getAzureSpeechSecret(AZURE_SPEECH_SECRET);
  const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);

  const processingTask = new Promise(async (resolve) => {
    console.log(`Processing prompt: ${fullQuery}`);

    try {
      await Promise.all([
        await updateMessageSystemStatus(
          userId,
          threadId,
          MessageSystemStatus.PROCESSING,
          {
            sender: 'User',
            message: query
          }
        ),
        await processAsynchronously({
          query: fullQuery,
          promptTemplate: persona.prompt,
          callback: async (chunk) => {
            console.log(`Received Chunk: ${chunk}`);
            await sendChunk({
              userId,
              threadId,
              chunk
            });
            eventResult += chunk;
            lastSentence += chunk;

            if (responseOptions.includeAudio) {
              // If we have a complete sentence, process the audio for it.
              const sentenceEndIndex = findSentenceEndIndex(lastSentence);
              if (sentenceEndIndex !== -1) {
                const sentence = lastSentence.substring(
                  0,
                  sentenceEndIndex + 1
                );
                lastSentence = lastSentence.substring(sentenceEndIndex + 1);

                audioJobs.push(
                  synthesizeAndUploadAudio(
                    cleanUpText(sentence),
                    speechConfig,
                    persona.voice,
                    BUCKET,
                    async (chunk) => {
                      console.log(`Received Audio Chunk: ${chunk}`);
                      await sendChunk({
                        userId,
                        threadId,
                        chunk,
                        chunkType: 'audio'
                      });
                    }
                  )
                );
              }
            }
          },
          model: persona.model,
          knowledgeBaseId: persona.knowledgeBaseId
        }),
        ...audioJobs
      ]);
    } catch (err) {
      console.error(err);
      eventResult = 'An error occurred while processing the prompt.';
    }

    resolve({ statusCode: 200, message: 'Success!' });
  });

  const res = await Promise.race([processingTask, timeoutTask]);

  await completeProcessing(userId, threadId, {
    sender: 'Assistant',
    message: eventResult
  });

  return res;
}

async function synthesizeAndUploadAudio(
  audioText: string,
  speechConfig: SpeechConfig,
  voice: string,
  userId: string,
  threadId: string
) {
  const audioFile = `/tmp/${generateUniqueId()}.mp3`;

  const result = await synthesizeAudio({
    message: audioText,
    speechConfig,
    audioFile,
    voice
  });

  const uuid = generateUniqueId();
  const uploadCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${uuid}.mp3`,
    Body: result
  });

  await s3Client.send(uploadCommand);

  const getObjectCommand = new GetObjectCommand({
    Bucket: BUCKET,
    Key: `${uuid}.mp3`
  });

  const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600
  });
  await sendChunk({
    userId,
    threadId,
    chunk: signedUrl,
    status: MessageSystemStatus.PROCESSING,
    chunkType: 'audio'
  });
}

function findSentenceEndIndex(text: string) {
  const periodIndex = text.lastIndexOf('.');
  const questionIndex = text.lastIndexOf('?');
  const exclamationIndex = text.lastIndexOf('!');
  return Math.max(periodIndex, Math.max(questionIndex, exclamationIndex));
}

function cleanUpText(text: string) {
  return text.replaceAll(/(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)/g, '');
}

function generateUniqueId() {
  return Math.random().toString(36).substring(7);
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
