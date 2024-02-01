/**
 * Publishes an event localy
 * @param {*} ctx the context
 * @returns {import('@aws-appsync/utils').NONERequest} the request
 */
export function request(ctx) {
  return {
    payload: {
      ...ctx.args.input
    }
  };
}

/**
 * Forward the payload in the `result` object
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
  return ctx.result;
}
