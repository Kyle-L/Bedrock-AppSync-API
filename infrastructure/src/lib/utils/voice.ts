import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { httpsClient, s3Client, ssmClient } from './clients';
import { RequestOptions } from 'https';
import { URL } from 'url';

// Static variables
const AUDIO_FORMAT = 'mp3';
const AUDIO_NAME_TEMPLATE = `%s.${AUDIO_FORMAT}`;
const AUDIO_UPLOAD_DIR = 'audio';

/**
 * Retrieves a secret from AWS Secrets Manager and casts it to the specified type.
 *
 * @param {string} secretArn - The ARN of the secret to retrieve.
 * @returns {Promise<T>} - A promise that resolves to the secret, cast to the specified type.
 * @throws {Error} - Throws an error if the secret retrieval fails.
 *
 * @template T - The type to which the secret should be cast.
 */
export async function getSpeechSecret<T>(secretArn: string): Promise<T> {
  try {
    const secretCommand = new GetSecretValueCommand({ SecretId: secretArn });
    const secretValue = await ssmClient.send(secretCommand);
    const secret = JSON.parse(secretValue.SecretString || '');
    return secret as T;
  } catch (error) {
    throw new Error('Failed to retrieve speech secret.');
  }
}

/**
 * Synthesizes speech using the Eleven Labs API.
 *
 * @param {Object} params - The parameters for the API request.
 * @param {string} params.voiceId - The ID of the voice to use for synthesis.
 * @param {string} params.message - The text to synthesize.
 * @param {string} params.apiKey - The API key for the Eleven Labs API.
 * @returns {Promise<Buffer>} - A promise that resolves to the synthesized audio as a buffer.
 * @throws {Error} - Throws an error if the speech synthesis fails.
 */
function synthesizeElevenLabsVoiceAsync({
  voiceId,
  audioText,
  apiKey
}: {
  voiceId: string;
  audioText: string;
  apiKey: string;
}): Promise<Buffer> {
  // Set options for the API request.
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'xi-api-key': `${apiKey}`
    }
  };

  const postData = JSON.stringify({
    text: audioText,
    voice_settings: { similarity_boost: 0.5, stability: 0.5 },
    model_id: 'eleven_monolingual_v1'
  });

  return makeHttpsRequest(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    options,
    postData
  );
}

/**
 * Synthesizes speech and uploads the audio to an S3 bucket.
 *
 * @param {Object} params - The parameters for the API request.
 * @param {string} params.audioText - The text to synthesize.
 * @param {string} params.speechSecretArn - The ARN of the secret containing the API key for the Eleven Labs API.
 * @param {Object} params.voiceId - The ID of the voice to use for synthesis.
 * @returns {Promise<Buffer>} - A promise that resolves to the signed URL of the uploaded audio.
 * @throws {Error} - Throws an error if the speech synthesis or audio upload fails.
 */
export async function synthesizeSpeechAudio({
  voiceId,
  audioText,
  speechSecretArn
}: {
  voiceId: string;
  audioText: string;
  speechSecretArn: string;
}): Promise<Buffer> {
  const { apiKey } = await getSpeechSecret<{ apiKey: string }>(speechSecretArn);

  audioText = removeMarkdownFormatting(audioText);

  const audio = await synthesizeElevenLabsVoiceAsync({
    voiceId,
    audioText,
    apiKey
  });

  return audio;
}

/**
 * Synthesizes speech and uploads the audio to an S3 bucket.
 *
 * @param {Object} params - The parameters for the API request.
 * @param {string} params.audioText - The text to synthesize.
 * @param {string} params.speechSecretArn - The ARN of the secret containing the API key for the Eleven Labs API.
 * @param {Object} params.voice - The voice to use for synthesis.
 * @param {string} params.bucket - The name of the S3 bucket to which to upload the audio.
 * @returns {Promise<string>} - A promise that resolves to the signed URL of the uploaded audio.
 * @throws {Error} - Throws an error if the speech synthesis or audio upload fails.
 */
export async function synthesizeSpeechAndUploadAudio({
  audioText,
  speechSecretArn,
  voice,
  bucket
}: {
  audioText: string;
  speechSecretArn: string;
  voice: { id: string };
  bucket: string;
}): Promise<string> {
  const audioFileName = AUDIO_NAME_TEMPLATE.replace(
    '%s',
    `${generateRandomId()}.${AUDIO_FORMAT}`
  );

  const result = await synthesizeSpeechAudio({
    audioText: audioText,
    voiceId: voice.id,
    speechSecretArn: speechSecretArn
  });

  const uploadCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: `${AUDIO_UPLOAD_DIR}/${audioFileName}`,
    Body: result
  });

  await s3Client.send(uploadCommand);

  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: `${AUDIO_UPLOAD_DIR}/${audioFileName}`
  });

  const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600
  });

  return signedUrl;
}

/**
 * Generates a random ID.
 *
 * @returns {string} - A random ID.
 */
function generateRandomId(): string {
  return Math.random().toString(36).substring(7);
}

/**
 * Removes Markdown formatting from a string.
 *
 * @param {string} text - The text from which to remove Markdown formatting.
 * @returns {string} - The text with Markdown formatting removed.
 */
function removeMarkdownFormatting(text: string): string {
  return text.replaceAll(/(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)/g, '');
}

function makeHttpsRequest(
  url: string | URL,
  options: RequestOptions,
  postData: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = httpsClient.request(url, options, (response) => {
      let buffer = Buffer.from([]);

      response.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
      });

      response.on('end', () => {
        if (
          !response.statusCode ||
          response.statusCode < 200 ||
          response.statusCode >= 300
        ) {
          reject(
            new Error(
              `Error: ${response.statusCode} - ${response.statusMessage}`
            )
          );
        } else {
          resolve(buffer);
        }
      });

      response.on('error', (error) => {
        reject(new Error(`Error making request: ${error.message}`));
      });
    });

    req.on('error', (error) => {
      console.error(`Error making request: ${error.message}`);
      reject(new Error(`Error making request: ${error.message}`));
    });

    // Write the post data to the request
    req.write(postData);

    // End the request
    req.end();
  });
}
