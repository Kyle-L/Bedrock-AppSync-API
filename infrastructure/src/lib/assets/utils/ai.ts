import { BedrockChat } from 'langchain/chat_models/bedrock';
import { StringOutputParser } from 'langchain/schema/output_parser';

const BEDROCK_REGION = 'us-east-1';

const MODEL_TUNINGS = {
  ai21: {
    params: {
      model: 'ai21.j2-ultra-v1',
      maxTokens: 200,
      temperature: 0.7
    },
    bindings: {
      stop: ['User:']
    }
  },
  claude: {
    params: {
      model: 'anthropic.claude-v2:1',
      maxTokens: 200,
      temperature: 0.7
    },
    bindings: {
      stop: ['\nUser:', '\n\nBot:']
    }
  }
};

/**
 * Perform an asynchronous prediction given a prompt and returns the chunks of the prediction as they are generated.
 * @param prompt {string} - The prompt to use for the prediction
 * @param callback {function} - The callback to call when a new chunk of the prediction is generated
 */
export const processAsynchronously = async ({
  prompt,
  model,
  callback
}: {
  prompt: string;
  model?: 'ai21' | 'claude';
  callback: (result: string) => Promise<void>;
}) => {
  // Default to Claude if no model is specified or if the string is not recognized
  if (!model || !MODEL_TUNINGS[model]) {
    model = 'claude';
  }

  const chat = new BedrockChat({
    ...MODEL_TUNINGS[model].params
  }).bind({
    ...MODEL_TUNINGS[model].bindings
  });

  const stream = await chat.pipe(new StringOutputParser()).stream([prompt]);

  for await (const chunk of stream) {
    await callback(chunk);
  }
};
