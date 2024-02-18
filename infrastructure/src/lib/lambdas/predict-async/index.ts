import { Context, SQSEvent } from 'aws-lambda';
import { processSingleEvent } from './logic';

// Constants
const EVENT_TIMEOUT_BUFFER = 5000; // 5 second

/**
 * Processes a batch of events.
 * @param event SQS event containing the batch of events to process.
 * @returns The results of the events.
 */
export async function handler(event: SQSEvent, context: Context) {
  if (!event.Records || event.Records.length === 0) {
    throw new Error('No records found in the event. Aborting operation.');
  }

  // Each event gets a timeout of the remaining time divided by the number of events, this way
  // we can ensure that we don't exceed the timeout for the lambda.
  const eventTimeout =
    (context.getRemainingTimeInMillis() - EVENT_TIMEOUT_BUFFER) /
    event.Records.length;

  const processingTasks = event.Records.map(async (record) => {
    const eventData = JSON.parse(record.body);

    console.log(`Received Event: ${JSON.stringify(eventData)}`);
    return processSingleEvent({
      userId: eventData.identity.sub,
      threadId: eventData.arguments.input.threadId,
      history: eventData.prev.result.messages || [],
      query: eventData.arguments.input.prompt,
      eventTimeout: eventTimeout,
      persona: eventData.prev.result.persona,
      responseOptions: {
        includeAudio: eventData.arguments.input.includeAudio
      }
    });
  });

  return Promise.all(processingTasks);
}
