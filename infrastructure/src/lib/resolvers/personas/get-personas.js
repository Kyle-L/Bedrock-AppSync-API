import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table and returns items created `today`
 */
export function request(ctx) {
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      pk: { eq: 'PERSONA' }
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

  // Remove pk and sk from the result items, replace with personaId
  return ctx.result.items.map((item) => ({
    personaId: item.sk.split('#')[1],
    pk: undefined,
    sk: undefined,
    ...item
  }));
}
