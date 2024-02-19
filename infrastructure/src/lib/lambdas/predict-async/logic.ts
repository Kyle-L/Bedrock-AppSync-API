import { processAsynchronously } from 'lib/utils/ai/bedrock-utils';
import { addMessage, updateThreadStatus } from 'lib/utils/dynamodb';
import { getCompleteSentence } from 'lib/utils/text/sentence-extractor';
import { createTimeoutTask } from 'lib/utils/time/timeout-task';
import { synthesizeSpeechAndUploadAudio } from 'lib/utils/voice';
import { EventType, MessageSystemStatus } from '../../utils/types';
import { S3_BUCKET, SPEECH_SECRET, TABLE_NAME } from './config';
import { sendChunk } from './queries';

async function processAIResponse({
  userId,
  threadId,
  completeQuery,
  query,
  persona,
  responseOptions
}: {
  userId: string;
  threadId: string;
  completeQuery: string;
  query: string;
  eventTimeout: number;
  persona: any;
  responseOptions: { includeAudio: boolean };
}) {
  let completeResponse = '';
  const audioClips: string[] = [];
  let lastSentenceResponse = '';

  await processAsynchronously({
    query,
    completeQuery,
    promptTemplate: persona.prompt,
    model: persona.model,
    knowledgeBaseId: persona.knowledgeBaseId,
    callback: async (chunk) => {
      try {
        completeResponse += chunk;
        lastSentenceResponse += chunk;

        const { sentence, remainingText, containsComplete } =
          getCompleteSentence(lastSentenceResponse);

        console.log(`Received Text Chunk: ${chunk}`);
        await sendChunk({
          userId,
          threadId,
          chunk: completeResponse,
          chunkType: 'text'
        });

        if (responseOptions.includeAudio && lastSentenceResponse.trim()) {
          if (containsComplete) {
            lastSentenceResponse = remainingText;

            console.log(`Received Audio Chunk: ${lastSentenceResponse}`);
            const audio = await synthesizeSpeechAndUploadAudio({
              voice: persona.voice,
              audioText: sentence,
              keyPrefix: `audio/${userId}/${threadId}/`,
              bucket: S3_BUCKET,
              speechSecretArn: SPEECH_SECRET
            });
            audioClips.push(audio);

            await sendChunk({
              userId,
              threadId,
              chunk: audio,
              chunkType: 'audio'
            });
          }
        }
      } catch (err) {
        console.error('An error occurred while processing the chunk:', err);
        await sendChunk({
          userId,
          threadId,
          chunk: 'An error occurred while processing the prompt.',
          chunkType: 'error'
        });
      }
    }
  });

  return {
    completeResponse,
    audioClips
  };
}

/**
 * Processes a single event.
 * @param userId {string} The user ID.
 * @param threadId {string} The thread ID.
 * @param userPrompt {string} The full prompt to process. This includes the thread's system prompt, message history, user's prompt, and start of the AI's response.
 * @param eventTimeout {number} The timeout for the event.
 * @returns {Promise<{ statusCode: number; message: string }>} The result of the event.
 */
export async function processSingleEvent({
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
    .join('\n\n')
    .trim();

  const completeQuery = `${formattedHistory}\nAssistant:`;

  // Tasks
  const timeoutTask = createTimeoutTask(eventTimeout);
  const processingTask = new Promise(async (resolve) => {
    console.log(`Processing prompt: ${completeQuery}`);

    const [_, { completeResponse, audioClips }] = await Promise.all([
      addMessage({
        id: userId,
        threadId,
        message: query,
        sender: 'User',
        tableName: TABLE_NAME
      }),

      processAIResponse({
        userId,
        threadId,
        completeQuery,
        query,
        eventTimeout,
        persona,
        responseOptions
      })
    ]);

    await Promise.all([
      addMessage({
        id: userId,
        threadId,
        message: completeResponse,
        audioClips,
        sender: 'Assistant',
        tableName: TABLE_NAME
      }),
      updateThreadStatus({
        id: userId,
        threadId,
        status: MessageSystemStatus.COMPLETE,
        tableName: TABLE_NAME
      }),
      await sendChunk({
        userId,
        threadId,
        status: MessageSystemStatus.COMPLETE,
        chunkType: 'status'
      })
    ]);

    resolve(completeResponse);
  });

  const res = await Promise.race([processingTask, timeoutTask]);

  return res;
}
