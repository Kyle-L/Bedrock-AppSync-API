import { get } from '@aws-appsync/utils/dynamodb';

/**
 * Queries a DynamoDB table and returns items created `today`
 */
export function request(ctx) {
  return get({
    key: {
      pk: `PERSONA`,
      sk: `PERSONA#${ctx.arguments.personaId}`
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
    personaId: ctx.result.sk.split('#')[1],
    pk: undefined,
    sk: undefined,
    ...ctx.result
  };
}
