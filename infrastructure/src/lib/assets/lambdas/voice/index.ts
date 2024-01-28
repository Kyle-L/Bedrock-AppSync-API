import { AppSyncResolverEvent } from 'aws-lambda';
import { getSecret, synthesizeAndUploadAudio } from 'lib/assets/utils/voice';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Environment variables
const { S3_BUCKET = '', AZURE_SPEECH_SECRET = '' } = process.env;

/**
 * Lambda function handler for speech synthesis and upload to S3.
 * @param {AppSyncResolverEvent} event - The Lambda event.
 * @returns {Promise<{ result: string }>} The signed URL of the uploaded audio file.
 */
export async function handler(
  event: AppSyncResolverEvent<{
    input: {
      message: string;
    };
  }>
): Promise<{ result: string }> {
  const { speechKey, speechRegion } = await getSecret(AZURE_SPEECH_SECRET);
  const speechConfig = azureSpeechSDK.SpeechConfig.fromSubscription(
    speechKey,
    speechRegion
  );

  const signedUrl = await synthesizeAndUploadAudio({
    audioText: event.arguments.input.message,
    bucket: S3_BUCKET,
    speechConfig,
    voice: event?.prev?.result?.persona.voice
  });

  return { result: signedUrl };
}
