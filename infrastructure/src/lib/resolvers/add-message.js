import { util } from '@aws-appsync/utils';

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 */
export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${ctx.args.input.userId}`,
      sk: `THREAD#${ctx.args.input.threadId}`
    }),
    update: {
      expression: 'SET #messages = list_append(if_not_exists(#messages, :empty_list), :messages), #status = :status',
      expressionNames: {
        '#messages': 'messages',
        '#status': 'status'
      },
      expressionValues: {
        ':messages': { L: [{ M: util.dynamodb.toMapValues(ctx.args.input.message) }] },
        ':status': { S: ctx.args.input.status },
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
  return {
    message: ctx.result.messages[ctx.result.messages.length - 1]
  };
}
