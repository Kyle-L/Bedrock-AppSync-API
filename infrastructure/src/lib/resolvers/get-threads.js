import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table and returns items created `today`
 */
export function request(ctx) {
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      pk: { eq: `USER#${ctx.identity.sub}` }
    })
  );
  return { operation: 'Query', query };
}

/**
 * Returns the query items
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result.items.map((item) => ({
    threadId: item.sk.split('#')[1],
    userId: item.pk.split('#')[1],
    ...item
  }));
}
