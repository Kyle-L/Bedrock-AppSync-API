import { util } from '@aws-appsync/utils';

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 */
export function request(ctx) {
  // Generates a random ID for the thread item
  const id = util.autoId();

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${ctx.identity.sub}`,
      sk: `THREAD#${id}`
    }),
    update: {
      expression: 'SET #data = :data, #status = :status, #persona = :persona',
      expressionNames: {
        '#status': 'status',
        '#persona': 'persona',
        '#data': 'data'
      },
      expressionValues: {
        ':status': { S: 'NEW' },
        ':persona': { M: util.dynamodb.toMapValues(ctx.prev.result) },
        ':data': { L: [] }
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
  return {
    userId: ctx.result.pk.split('#')[1],
    threadId: ctx.result.sk.split('#')[1],
    ...ctx.result
  };
}
