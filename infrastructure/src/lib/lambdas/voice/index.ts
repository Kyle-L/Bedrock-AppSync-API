import { AppSyncResolverEvent } from 'aws-lambda';
import { synthesizeSpeechAndUploadAudio } from 'lib/utils/voice';

// Environment variables
const { S3_BUCKET = '', SPEECH_SECRET = '' } = process.env;

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
  const signedUrl = await synthesizeSpeechAndUploadAudio({
    audioText: event.arguments.input.message,
    bucket: S3_BUCKET,
    voice: event?.prev?.result?.persona.voice,
    speechSecretArn: SPEECH_SECRET
  });

  return { result: signedUrl };
}
