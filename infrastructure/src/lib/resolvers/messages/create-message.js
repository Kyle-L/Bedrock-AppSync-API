import { util } from '@aws-appsync/utils';

/**
 * Appends a message to a thread in the DynamoDB table.
 */
export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${ctx.args.input.userId}`,
      sk: `THREAD#${ctx.args.input.threadId}`
    }),
    condition: util.transform.toDynamoDBConditionExpression({
      pk: { attributeExists: true },
      sk: { attributExists: true }
    }),
    update: {
      expression:
        'SET #messages = list_append(if_not_exists(#messages, :empty_list), :messages), #status = :status',
      expressionNames: {
        '#messages': 'messages',
        '#status': 'status'
      },
      expressionValues: {
        ':messages': {
          L: [
            {
              M: util.dynamodb.toMapValues({
                ...ctx.args.input.message,
                createdAt: util.time.nowISO8601()
              })
            }
          ]
        },
        ':status': { S: ctx.args.input.status },
        ':empty_list': { L: [] }
      }
    }
  };
}

/**
 * Gets all the messages in a thread.
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    message: ctx.result.messages[ctx.result.messages.length - 1]
  };
}
