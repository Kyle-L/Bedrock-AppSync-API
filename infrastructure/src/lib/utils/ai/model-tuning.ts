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

/**
 * Model tunings for different AI models supported by Bedrock.
 * This is used to help configure the AI models for different use cases.
 */
export const MODEL_TUNINGS: ModelTunings<string> = {
  'amazon.titan-text-express-v1': {
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
  'ai21.j2-ultra-v1': {
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
  'anthropic.claude-v2:1': {
    params: {
      model: 'anthropic.claude-v2:1',
      maxTokens: 200,
      temperature: 0.7
    },
    bindings: {
      stop: ['\nUser:', '\nAssistant:']
    }
  },
  'anthropic.claude-instant-v1': {
    params: {
      model: 'anthropic.claude-instant-v1',
      maxTokens: 500,
      temperature: 0.7
    },
    bindings: {
      stop: ['\nUser:', '\nAssistant:']
    }
  },
  'anthropic.claude-3-sonnet-20240229-v1:0': {
    params: {
      model: 'anthropic.claude-instant-v1',
      maxTokens: 1000,
      temperature: 0.7
    },
    bindings: {
      stop: ['\nUser:', '\nAssistant:']
    }
  }
};
