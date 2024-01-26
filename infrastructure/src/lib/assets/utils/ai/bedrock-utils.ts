import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { MODEL_TUNINGS } from './model-tuning';
import { BedrockAgentRuntime } from 'aws-sdk'; // Assuming AWS SDK has Bedrock client
import { defaultTemplate } from './model-templates';
import { PromptTemplate } from '@langchain/core/prompts';

const runtime = new BedrockAgentRuntime();

/**
 * Perform an asynchronous prediction given a prompt and returns the chunks of the prediction as they are generated.
 * @param prompt {string} - The prompt to use for the prediction
 * @param callback {function} - The callback to call when a new chunk of the prediction is generated.
 */
export async function processAsynchronously({
  query,
  promptTemplate,
  model,
  knowledgeBaseId,
  callback
}: {
  query: string;
  promptTemplate?: string;
  model?: string;
  knowledgeBaseId?: string;
  callback: (result: string) => Promise<void>;
}) {
  if (model && !(model in MODEL_TUNINGS)) {
    throw new Error(`Model ${model} is not supported`);
  }

  if (!model) {
    model = 'claude';
  }

  // Default to Claude if no model is specified or if the string is not recognized
  const modelTyped = model as keyof typeof MODEL_TUNINGS;

  console.log(
    `Initializing ${modelTyped} model with configuration:`,
    JSON.stringify(MODEL_TUNINGS[modelTyped].params)
  );

  let documentContext;
  if (knowledgeBaseId) {
    documentContext = await getContext(query, knowledgeBaseId);
    console.log(`Document context: ${documentContext}`);
  } else {
    console.log('No knowledge base ID provided, skipping document context...');
  }

  const chat = new BedrockChat({
    ...MODEL_TUNINGS[modelTyped].params,
    streaming: true
  }).bind({
    ...MODEL_TUNINGS[modelTyped].bindings
  });

  // If a prompt template is provided, use that, otherwise use the default template
  const template = promptTemplate
    ? PromptTemplate.fromTemplate(promptTemplate)
    : defaultTemplate;
  const formattedPrompt = await template.format({
    query,
    search_results: documentContext
  });

  const stream = chat.pipe(new StringOutputParser()).stream(formattedPrompt);

  for await (const chunk of await stream) {
    await callback(chunk);
  }
}

/**
 * Retrieves the document context from the knowledge base and
 * formats it for use in the prediction.
 * @param prompt {string} - The prompt to use for the prediction
 * @param knowledgeBaseId {string} - The knowledge base ID to use for the prediction
 * @returns {string} - The formatted document context
 */
async function getContext(
  prompt: string,
  knowledgeBaseId: string
): Promise<string> {
  const result = await runtime
    .retrieve({
      knowledgeBaseId,
      retrievalQuery: {
        text: prompt
      }
    })
    .promise();

  return (
    result?.retrievalResults
      .map((result) => result.content.text)
      .join('\n\n') || ''
  );
}
