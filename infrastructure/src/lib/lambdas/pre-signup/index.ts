import { Context, PreSignUpTriggerEvent } from 'aws-lambda';

export async function handler(
  {
    request: {
      userAttributes: { name }
    }
  }: PreSignUpTriggerEvent,
  _context: Context,
  callback: Function
) {
  // Only allow users with the a name to signup.
  callback(name ? null : new Error('A name is required for sign-up.'));
}
