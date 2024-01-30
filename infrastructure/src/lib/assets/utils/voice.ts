import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { s3Client } from './clients';

// Static variables
const AUDIO_FORMAT = 'mp3';
const AUDIO_NAME_TEMPLATE = `%s.${AUDIO_FORMAT}`;
const AUDIO_UPLOAD_DIR = 'audio';

/**
 * Gets the Azure Speech secret from Secrets Manager.
 * @returns {Promise<{ speechKey: string; speechRegion: string; }>} The Azure Speech secret.
 */
export async function getSecret(secretId: string): Promise<{
  speechKey: string;
  speechRegion: string;
}> {
  const ssmClient = new SecretsManagerClient();
  let speechKey,
    speechRegion = '';

  try {
    if (!speechKey || !speechRegion) {
      const secretCommand = new GetSecretValueCommand({
        SecretId: secretId
      });
      const secretValue = await ssmClient.send(secretCommand);
      const secret = JSON.parse(secretValue.SecretString || '');
      return { speechKey: secret.key, speechRegion: secret.region };
    }
  } catch (error) {
    throw new Error('Failed to retrieve Azure Speech secret.');
  }

  return { speechKey, speechRegion };
}

function cleanUpText(text: string) {
  return text.replaceAll(/(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)/g, '');
}

export async function synthesizeAudio({
  voice,
  message,
  audioFile,
  speechConfig
}: {
  voice: { name: string; style?: string };
  message: string;
  audioFile: string;
  speechConfig: azureSpeechSDK.SpeechConfig;
}) {
  message = cleanUpText(message);

  const messageSSML = `
  <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
    <voice name='${voice.name}'>
      <mstts:express-as ${
        voice.style ? `style='${voice.style}' styledegree='1.25'` : ''
      }>
        ${message || ''}
      </mstts:express-as>
    </voice>
  </speak>`;

  const audioConfig = azureSpeechSDK.AudioConfig.fromAudioFileOutput(audioFile);
  speechConfig.speechSynthesisOutputFormat =
    azureSpeechSDK.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3;

  const synthesizer = new azureSpeechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig
  );

  console.log(`Synthesizing speech for text: ${messageSSML}`);
  const result: Buffer = await new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      messageSSML,
      (result) => {
        if (
          result.reason ===
          azureSpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          console.log(`Speech synthesized for text: ${messageSSML}`);
          resolve(Buffer.from(result.audioData));
        } else {
          console.error('Speech synthesis failed:', result.errorDetails);
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
  return result;
}

function generateUniqueId() {
  return Math.random().toString(36).substring(7);
}

export async function synthesizeAndUploadAudio({
  audioText,
  speechConfig,
  voice,
  bucket
}: {
  audioText: string;
  speechConfig: azureSpeechSDK.SpeechConfig;
  voice: { name: string; style?: string };
  bucket: string;
}) {
  const audioFileName = AUDIO_NAME_TEMPLATE.replace(
    '%s',
    `${generateUniqueId()}.${AUDIO_FORMAT}`
  );
  const audioFile = `/tmp/${audioFileName}`;

  const result = await synthesizeAudio({
    message: audioText,
    speechConfig,
    audioFile,
    voice
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
