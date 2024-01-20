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

export const MODEL_TUNINGS: ModelTunings<'claude' | 'ai21' | 'titan' | 'claudeInstant'> = {
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
  },
  claudeInstant: {
    params: {
      model: 'anthropic.claude-instant-v1',
      maxTokens: 500,
      temperature: 0.7
    },
    bindings: {
      stop: ['\nUser:', '\nAssistant:']
    }
  }
};
