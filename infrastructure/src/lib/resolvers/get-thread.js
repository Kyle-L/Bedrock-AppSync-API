import { get } from '@aws-appsync/utils/dynamodb';
import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table and returns items created `today`
 */
export function request(ctx) {
  return get({
    key: {
      pk: `USER#${ctx.identity.sub}`,
      sk: `THREAD#${ctx.arguments.threadId}`
    }
  });
}

/**
 * Returns the fetched DynamoDB item
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
