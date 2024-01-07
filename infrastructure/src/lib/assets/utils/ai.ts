import { BedrockChat } from 'langchain/chat_models/bedrock';
import { StringOutputParser } from 'langchain/schema/output_parser';

type ModelTunings<T extends string> = {
  [key in T]: {
    params: {
      [key: string]: any;
    };
    bindings?: {
      stop?: string[];
    };
  };
};

const MODEL_TUNINGS: ModelTunings<'claude' | 'ai21' | 'titan'> = {
  titan: {
    params: {
      model: 'amazon.titan-text-express-v1',
      maxTokens: 200,
      temperature: 0.7,
      modelKwargs: {
        textGenerationConfig: {
          stopSequences: ['User:'],
          temperature: 0,
          topP: 1
        }
      }
    }
  },
  ai21: {
    params: {
      model: 'ai21.j2-ultra-v1',
      maxTokens: 200,
      temperature: 0.7,
      modelKwargs: {
        topP: 1,
        countPenalty: {
          scale: 0
        },
        frequencyPenalty: { scale: 0 },
        presencePenalty: { scale: 0 }
      }
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
      stop: ['\nUser:', '\nAssistant:']
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
  model?: string;
  callback: (result: string) => Promise<void>;
}) => {
  if (model && !(model in MODEL_TUNINGS)) {
    throw new Error(`Model ${model} is not supported`);
  }

  if (!model) {
    model = 'claude';
  }

  // Default to Claude if no model is specified or if the string is not recognized
  const modelTyped = model as keyof typeof MODEL_TUNINGS;

  console.log(`Initializing ${modelTyped} model with configuration:`, JSON.stringify(MODEL_TUNINGS[modelTyped].params));

  const chat = new BedrockChat({
    ...MODEL_TUNINGS[modelTyped].params,
    streaming: true
  }).bind({
    ...MODEL_TUNINGS[modelTyped].bindings
  });

  const stream = await chat.pipe(new StringOutputParser()).stream([prompt]);

  for await (const chunk of stream) {
    await callback(chunk);
  }
};
