import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Static variables
const AUDIO_FORMAT = 'mp3';
const AUDIO_NAME_TEMPLATE = `%s.${AUDIO_FORMAT}`;
const AUDIO_UPLOAD_DIR = 'audio';

// Clients
const s3Client = new S3Client();

/**
 * Gets the Azure Speech secret from Secrets Manager.
 * @returns {Promise<{ speechKey: string; speechRegion: string; }>} The Azure Speech secret.
 */
export async function getAzureSpeechSecret(secretId: string): Promise<{
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

export async function synthesizeAudio({
  voice,
  message,
  audioFile,
  speechConfig
}: {
  voice: string;
  message: string;
  audioFile: string;
  speechConfig: azureSpeechSDK.SpeechConfig;
}) {
  const messageSSML = `
  <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
    <voice name='${voice}'>
      ${message || ''}
    </voice>
  </speak>`;

  const audioConfig = azureSpeechSDK.AudioConfig.fromAudioFileOutput(audioFile);
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat =
    azureSpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  const synthesizer = new azureSpeechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig
  );

  console.log(`Synthesizing speech for text: ${message}`);
  const result: Buffer = await new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      messageSSML,
      (result) => {
        if (
          result.reason ===
          azureSpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          console.log(`Speech synthesized for text: ${message}`);
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

export async function synthesizeAndUploadAudio(
  audioText: string,
  speechConfig: azureSpeechSDK.SpeechConfig,
  voice: string,
  bucket: string
) {
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
