import { Context, SQSEvent } from 'aws-lambda';
import { processSingleEvent } from './logic';

// Constants
const EVENT_TIMEOUT_BUFFER = 5000; // 5 second

/**
 * Processes a batch of events.
 * @param event SQS event containing the batch of events to process.
 * @returns The results of the events.
 */
export async function handler({ Records }: SQSEvent, context: Context) {
  if (!Records || Records.length === 0) {
    throw new Error('No records found in the event. Aborting operation.');
  }

  // Each event gets a timeout of the remaining time divided by the number of events, this way
  // we can ensure that we don't exceed the timeout for the lambda.
  const eventTimeout =
    (context.getRemainingTimeInMillis() - EVENT_TIMEOUT_BUFFER) /
    Records.length;

  const processingTasks = Records.map(async (record) => {
    const event = JSON.parse(record.body);

    console.log(`Received Event: ${JSON.stringify(event)}`);
    return processSingleEvent({
      userId: event.identity.sub,
      threadId: event.arguments.input.threadId,
      history: event.prev.result.messages || [],
      query: event.arguments.input.prompt,
      eventTimeout: eventTimeout,
      persona: event.prev.result.persona,
      responseOptions: {
        includeAudio: event.arguments.input.includeAudio
      }
    });
  });

  return Promise.all(processingTasks);
}
