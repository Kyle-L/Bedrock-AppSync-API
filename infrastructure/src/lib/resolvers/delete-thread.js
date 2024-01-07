import { util } from '@aws-appsync/utils';

/**
 * Deletes an item with id `ctx.args.id` from the DynamoDB table
 */
export function request(ctx) {
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${ctx.identity.sub}`,
      sk: `THREAD#${ctx.arguments.input.threadId}`
    })
  };
}

/**
 * Returns the deleted item. Throws an error if the operation failed
 * @returns {*} the deleted item
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    thread: ctx.result
  }
}
