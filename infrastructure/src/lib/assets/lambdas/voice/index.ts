import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AppSyncIdentityCognito,
  AppSyncResolverEvent,
  Handler
} from 'aws-lambda';
import { getAzureSpeechSecret, synthesizeAudio } from 'lib/assets/utils/voice';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Static variables
const AUDIO_FORMAT = 'mp3';
const AUDIO_NAME_TEMPLATE = `audio-%s.${AUDIO_FORMAT}`;

// Environment variables
const S3_BUCKET = process.env.S3_BUCKET || '';
const AZURE_SPEECH_SECRET = process.env.AZURE_SPEECH_SECRET || '';

// Create clients
const s3Client = new S3Client();

/**
 * Lambda function handler for speech synthesis and upload to S3.
 * @param {AppSyncResolverEvent} event - The Lambda event.
 * @returns {Promise<{ result: string }>} The signed URL of the uploaded audio file.
 */
export const handler: Handler = async (
  event: AppSyncResolverEvent<{
    input: {
      message: string;
    };
  }>
) => {
  console.log('Received Event:', event);

  // Sets up Azure Speech Config
  const { speechKey, speechRegion } =
    await getAzureSpeechSecret(AZURE_SPEECH_SECRET);
  const speechConfig = azureSpeechSDK.SpeechConfig.fromSubscription(
    speechKey,
    speechRegion
  );

  // Gets the persona's voice from the event
  const voice = event?.prev?.result?.persona.voice || 'en-US-JennyNeural';

  const result = await synthesizeAudio({
    audioFile: `/tmp/temp.${AUDIO_FORMAT}`,
    message: event.arguments.input.message,
    speechConfig,
    voice
  });

  // Upload
  const id = (event.identity as AppSyncIdentityCognito).sub;
  const uuid = Math.random().toString(36).substring(7);
  const uploadKey = AUDIO_NAME_TEMPLATE.replace('%s', `${id}-${uuid}`);
  const uploadCommand = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: uploadKey,
    Body: result
  });
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: uploadKey
  });

  try {
    // Use Promise.all to execute the upload and getSignedUrl operations in parallel
    const [_uploadResponse, signedUrl] = await Promise.all([
      s3Client.send(uploadCommand),
      getSignedUrl(s3Client, command, { expiresIn: 3600 })
    ]);

    return {
      result: signedUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload to S3.');
  }
};
