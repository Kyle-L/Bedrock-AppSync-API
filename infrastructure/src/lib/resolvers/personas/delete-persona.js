import { util } from '@aws-appsync/utils';

/**
 * Deletes a persona from the DynamoDB table
 */
export function request(ctx) {
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      pk: 'PERSONA',
      sk: `PERSONA#${ctx.arguments.input.personaId}`
    })
  };
}

/**
 * Returns the deleted persona. Throws an error if the operation failed
 * @returns {*} the deleted item
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    persona: {
      personaId: ctx.result.sk.split('#')[1],
      pk: undefined,
      sk: undefined,
      ...ctx.result
    }
  };
}
