import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppSyncIdentityCognito, AppSyncResolverEvent, Handler } from 'aws-lambda';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Static variables
const AUDIO_FORMAT = 'mp3';
const AUDIO_NAME_TEMPLATE = `audio-%s.${AUDIO_FORMAT}`;

// Environment variables
const S3_BUCKET = process.env.S3_BUCKET || '';
const AZURE_SPEECH_SECRET = process.env.AZURE_SPEECH_SECRET || '';

// Create clients
const ssmClient = new SecretsManagerClient();
const s3Client = new S3Client();

/**
 * Gets the Azure Speech secret from Secrets Manager.
 * @returns {Promise<{ speechKey: string; speechRegion: string; }>} The Azure Speech secret.
 */
const getSpeechSecret = async (): Promise<{ speechKey: string; speechRegion: string }> => {
  let speechKey = '';
  let speechRegion = '';

  if (!speechKey || !speechRegion) {
    try {
      const secretCommand = new GetSecretValueCommand({
        SecretId: AZURE_SPEECH_SECRET
      });
      const secretValue = await ssmClient.send(secretCommand);
      const secret = JSON.parse(secretValue.SecretString || '');
      speechKey = secret.key;
      speechRegion = secret.region;
    } catch (error) {
      console.error('Error fetching Azure Speech secret:', error);
      throw new Error('Failed to retrieve Azure Speech secret.');
    }
  }

  return { speechKey, speechRegion };
};

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
  const { speechKey, speechRegion } = await getSpeechSecret();
  const speechConfig = azureSpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);

  // Gets the persona's voice from the event
  const voice = event?.prev?.result?.persona?.voice || 'en-US-JennyNeural';

  // Gets the message from the event
  const message = `
    <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
      <voice name='${voice}'>
        ${event?.arguments?.input?.message || ''}
      </voice>
    </speak>`;

  // Create audio config
  const audioFile = `/tmp/temp.${AUDIO_FORMAT}`;
  const audioConfig = azureSpeechSDK.AudioConfig.fromAudioFileOutput(audioFile);

  // Set language and audio format
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat = azureSpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  // Creates a speech synthesizer using the default speaker as audio output
  const synthesizer = new azureSpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  // Creates the synthesis request
  const result: Buffer = await new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      message,
      (result) => {
        if (result.reason === azureSpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('Speech synthesized to speaker for text [' + message + ']');
          const audioBuffer = Buffer.from(result.audioData);
          resolve(audioBuffer);
        } else {
          console.error('Speech synthesis canceled:', result.errorDetails);
          reject(new Error('Speech synthesis failed.'));
        }
      },
      (err) => {
        console.error('Speech synthesis error:', err);
        reject(new Error('Speech synthesis failed.'));
      }
    );
  });
  synthesizer.close();

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
