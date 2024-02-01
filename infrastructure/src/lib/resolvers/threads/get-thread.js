import { get } from '@aws-appsync/utils/dynamodb';
import { util } from '@aws-appsync/utils';

/**
 * Gets a thread from the DynamoDB table given a threadId.
 */
export function request(ctx) {
  const userId = ctx.identity.sub;
  const id = ctx.arguments.input.threadId;

  return get({
    key: {
      pk: `USER#${userId}`,
      sk: `THREAD#${id}`
    }
  });
}

/**
 * Returns the fetched thread or throws an error if the operation failed.
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    threadId: ctx.result.sk.split('#')[1],
    userId: ctx.result.pk.split('#')[1],
    ...ctx.result
  };
}
