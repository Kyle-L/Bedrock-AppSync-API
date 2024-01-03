import { Context, PreSignUpTriggerEvent } from 'aws-lambda';

export async function handler(event: PreSignUpTriggerEvent, context: Context, callback: any) {
  // Only allow users with the a name to signup. Additional requirements can be added here.
  if (!event.request.userAttributes.name) {
    const error = new Error('A name is required for sign-up.');

    // Return to Amazon Cognito
    callback(error, event);
  }

  // Return to Amazon Cognito
  callback(null, event);
}
