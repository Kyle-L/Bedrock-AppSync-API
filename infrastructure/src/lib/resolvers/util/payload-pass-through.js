/**
 * Passes the arguments through to the payload.
 */
export function request(ctx) {
  return {
    payload: {
      ...ctx.args
    }
  };
}

/**
 * Forward the payload in the `result` object
 */
export function response(ctx) {
  return ctx.result;
}
