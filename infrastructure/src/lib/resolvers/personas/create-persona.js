import { util } from '@aws-appsync/utils';

/**
 * Updates an item in the DynamoDB table.
 */
export function request(ctx) {
  const input = ctx.args.input;
  const id = util.autoId();
  const keys = Object.keys(input).filter(
    (key) => input[key] !== null && input[key] !== undefined
  );

  const expression =
    'SET ' +
    keys.map((key) => `#${key} = :${key}`).join(', ') +
    ', #createdAt = :createdAt';
  const expressionNames = keys.reduce(
    (obj, key) => ({ ...obj, [`#${key}`]: key }),
    {
      '#createdAt': 'createdAt'
    }
  );
  const expressionValues = keys.reduce((obj, key) => {
    return {
      ...obj,
      [`:${key}`]:
        typeof input[key] === 'object'
        ? { M: util.dynamodb.toMapValues(input[key]) }
        : { S: input[key] }
    };
  }, {});

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `PERSONA`,
      sk: `PERSONA#${id}`
    }),
    update: {
      expression,
      expressionNames,
      expressionValues: {
        ...expressionValues,
        ':createdAt': { S: `${util.time.nowISO8601()}` }
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
    persona: {
      personaId: ctx.result.sk.split('#')[1],
      pk: undefined,
      sk: undefined,
      ...ctx.result
    }
  };
}
