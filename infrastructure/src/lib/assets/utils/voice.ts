import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import * as azureSpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Environment variables
const AZURE_SPEECH_SECRET = process.env.AZURE_SPEECH_SECRET || '';

/**
 * Gets the Azure Speech secret from Secrets Manager.
 * @returns {Promise<{ speechKey: string; speechRegion: string; }>} The Azure Speech secret.
 */
export const getSpeechSecret = async (): Promise<{ speechKey: string; speechRegion: string }> => {
  const ssmClient = new SecretsManagerClient();
  let speechKey,
    speechRegion = '';

  try {
    if (!speechKey || !speechRegion) {
      const secretCommand = new GetSecretValueCommand({
        SecretId: AZURE_SPEECH_SECRET
      });
      const secretValue = await ssmClient.send(secretCommand);
      const secret = JSON.parse(secretValue.SecretString || '');
      return { speechKey: secret.key, speechRegion: secret.region };
    }
  } catch (error) {
    throw new Error('Failed to retrieve Azure Speech secret.');
  }

  return { speechKey, speechRegion };
};

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
  const messageSSML = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name='${voice}'>${
    message || ''
  }</voice></speak>`;

  const audioConfig = azureSpeechSDK.AudioConfig.fromAudioFileOutput(audioFile);
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat = azureSpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  const synthesizer = new azureSpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  const result: Buffer = await new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      messageSSML,
      (result) => {
        if (result.reason === azureSpeechSDK.ResultReason.SynthesizingAudioCompleted) {
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
