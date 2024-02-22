import { util } from '@aws-appsync/utils';

/**
 * Creates a new thread in the DynamoDB table.
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
      expression:
        'SET #messages = :messages, #status = :status, #createdAt = :createdAt, #persona = :persona, #ttl = :ttl',
      expressionNames: {
        '#status': 'status',
        '#createdAt': 'createdAt',
        '#persona': 'persona',
        '#messages': 'messages',
        '#ttl': 'ttl'
      },
      expressionValues: {
        ':status': { S: 'NEW' },
        ':createdAt': { S: `${util.time.nowISO8601()}` },
        ':persona': { M: util.dynamodb.toMapValues(ctx.prev.result) },
        ':messages': { L: [] },
        ':ttl': { N: `${util.time.nowEpochMilliSeconds() + 60 * 60 * 24 * 7}` } // 7 days
      }
    }
  };
}

/**
 * Returns the thread or throws an error if the operation failed
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
