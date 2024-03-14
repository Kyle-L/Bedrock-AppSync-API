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
