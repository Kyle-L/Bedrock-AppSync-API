import { util } from '@aws-appsync/utils';

/**
 * Deletes a thread that belongs to the user from the DynamoDB table.
 */
export function request(ctx) {
  const userId = ctx.identity.sub;
  const id = ctx.arguments.input.threadId;

  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${userId}`,
      sk: `THREAD#${id}`
    })
  };
}

/**
 * Returns the deleted item. Throws an error if the operation failed
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    thread: {
      threadId: ctx.result.sk.split('#')[1],
      userId: ctx.result.pk.split('#')[1],
      ...ctx.result
    }
  };
}
