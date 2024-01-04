import { BedrockChat } from 'langchain/chat_models/bedrock';
import { StringOutputParser } from 'langchain/schema/output_parser';

const BEDROCK_REGION = 'us-east-1';

const chat = new BedrockChat({
  model: 'anthropic.claude-v2:1',
  region: BEDROCK_REGION,
  maxTokens: 200,
  temperature: 0.7
}).bind({
  stop: ['\n\nHuman:', '\n\nAssistant:']
});

/**
 * Perform an asynchronous prediction given a prompt and returns the chunks of the prediction as they are generated.
 * @param prompt {string} - The prompt to use for the prediction
 * @param callback {function} - The callback to call when a new chunk of the prediction is generated
 */
export const processAsynchronously = async (prompt: string, callback: (result: string) => Promise<void>) => {
  const stream = await chat.pipe(new StringOutputParser()).stream([prompt]);

  for await (const chunk of stream) {
    await callback(chunk);
  }
};
