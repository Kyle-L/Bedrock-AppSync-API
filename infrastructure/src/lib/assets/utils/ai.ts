import { BedrockChat } from 'langchain/chat_models/bedrock';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { MODEL_TUNINGS } from './tuning';
import { BedrockAgentRuntime } from 'aws-sdk'; // Assuming AWS SDK has Bedrock client

const runtime = new BedrockAgentRuntime();

/**
 * Perform an asynchronous prediction given a prompt and returns the chunks of the prediction as they are generated.
 * @param prompt {string} - The prompt to use for the prediction
 * @param callback {function} - The callback to call when a new chunk of the prediction is generated
 */
export const processAsynchronously = async ({
  prompt,
  model,
  knowledgeBaseId,
  callback
}: {
  prompt: string;
  model?: string;
  knowledgeBaseId?: string;
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

  let result;
  if (knowledgeBaseId) {
    result = await runtime
      .retrieve({
        knowledgeBaseId,
        retrievalQuery: {
          text: prompt
        }
      })
      .promise();
  }

  const documentContext = JSON.stringify(result?.retrievalResults);
  console.log(`Document context: ${documentContext}`);

  const chat = new BedrockChat({
    ...MODEL_TUNINGS[modelTyped].params,
    streaming: true
  }).bind({
    ...MODEL_TUNINGS[modelTyped].bindings
  });

  const promptWithDocumentContext = `<context>${documentContext}\n\n</context>${prompt}`;

  const stream = await chat.pipe(new StringOutputParser()).stream(promptWithDocumentContext);

  for await (const chunk of stream) {
    await callback(chunk);
  }
};
