import { util } from '@aws-appsync/utils';

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 */
export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${ctx.args.userId}`,
      sk: `THREAD#${ctx.args.threadId}`
    }),
    update: {
      expression: 'SET #data = list_append(if_not_exists(#data, :empty_list), :data), #status = :status',
      expressionNames: {
        '#data': 'data',
        '#status': 'status'
      },
      expressionValues: {
        ':data': { L: [{ M: util.dynamodb.toMapValues(ctx.args.message) }] },
        ':status': { S: ctx.args.status },
        ':empty_list': { L: [] }
      }
    }
  };
}

/**
 * Returns the item or throws an error if the operation failed
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
