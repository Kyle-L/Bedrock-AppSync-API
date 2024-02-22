import { get } from '@aws-appsync/utils/dynamodb';

/**
 * Gets a persona from the DynamoDB table given a personaId.
 */
export function request(ctx) {
  return get({
    key: {
      pk: 'PERSONA',
      sk: `PERSONA#${ctx.args.input.personaId}`
    }
  });
}

/**
 * Returns the fetched persona or throws an error if the operation failed.
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
