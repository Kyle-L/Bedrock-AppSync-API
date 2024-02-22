import { util } from '@aws-appsync/utils';

/**
 * Gets all threads from the DynamoDB table that belong to the user.
 */
export function request(ctx) {
  const id = ctx.identity.sub;

  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      pk: { eq: `USER#${id}` }
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
