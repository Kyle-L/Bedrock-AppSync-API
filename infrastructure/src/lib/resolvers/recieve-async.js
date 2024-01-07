import { util, extensions } from '@aws-appsync/utils';

/**
 * Sends an empty payload as the subscription is established
 * @param {*} ctx the context
 */
export function request(ctx) {
  //noop
  return { payload: {} };
}

/**
 * Creates an enhanced subscription
 * @returns {*} the result
 */
export function response(ctx) {
  // This filter sets up a subscription that is triggered when:
  // a users id is in the data field
  const filter = util.transform.toSubscriptionFilter({
    userId: { eq: ctx.identity.sub },
    threadId: { eq: ctx.args.input.threadId }
  });

  extensions.setSubscriptionFilter(filter);
  return null;
}
