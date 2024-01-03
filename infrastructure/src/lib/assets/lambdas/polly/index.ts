import { Polly, StartSpeechSynthesisTaskCommandInput, VoiceId } from '@aws-sdk/client-polly';
import { AppSyncResolverEvent, Handler } from 'aws-lambda';

const S3_BUCKET = process.env.S3_BUCKET || '';

const pollyClient = new Polly({ region: 'us-east-1' });

interface EventArguments {
  [key: string]: string;
}
interface Event
  extends AppSyncResolverEvent<{
    arguments: EventArguments;
    [key: string]: string | EventArguments;
  }> {}

export const handler: Handler = async (event: Event) => {
  console.log('Received Event:', event);

  try {
    // Generate speech using Polly
    const pollyParams: StartSpeechSynthesisTaskCommandInput = {
      OutputFormat: 'mp3',
      Text: `${event.arguments.message}`,
      VoiceId: VoiceId.Joanna,
      OutputS3BucketName: S3_BUCKET,
      OutputS3KeyPrefix: 'audio',
      Engine: 'neural'
    };
    const pollyResult = await pollyClient.startSpeechSynthesisTask(pollyParams);

    return pollyResult.SynthesisTask?.OutputUri;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred');
  }
};
