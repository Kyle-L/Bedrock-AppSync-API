import { Polly, StartSpeechSynthesisTaskCommandInput, VoiceId } from '@aws-sdk/client-polly';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppSyncResolverEvent, Handler } from 'aws-lambda';

const S3_BUCKET = process.env.S3_BUCKET || '';

const pollyClient = new Polly();
const s3Client = new S3Client();

interface EventArguments {
  [key: string]: string;
}
interface Event
  extends AppSyncResolverEvent<{
    input: {
      message: string;
    };
  }> {}

export const handler: Handler = async (event: Event) => {
  console.log('Received Event:', event);

  try {
    // Gets the persona's voice from the event
    const voice = event?.prev?.result?.voice || 'Joanna';

    // Generate speech using Polly
    const pollyParams: StartSpeechSynthesisTaskCommandInput = {
      OutputFormat: 'mp3',
      Text: `${event.arguments.input.message}`,
      VoiceId: voice as VoiceId,
      OutputS3BucketName: S3_BUCKET,
      OutputS3KeyPrefix: 'audio',
      Engine: 'long-form'
    };
    const pollyResult = await pollyClient.startSpeechSynthesisTask(pollyParams);

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: pollyResult.SynthesisTask?.OutputUri?.split('/').pop() || ''
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      result: signedUrl
    };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred');
  }
};
