/**
 * Passes all arguments to the next step.
 * @param {...any} args - All arguments passed to the function
 * @returns {Array} All arguments passed to the function
 */
export function request(...args) {
  return args;
}

/**
 * Returns the result of the previous step.
 * @param {Object} ctx - The context object
 * @returns {Object} The result of the previous step
 */
export function response(ctx) {
  return ctx.prev.result;
}
