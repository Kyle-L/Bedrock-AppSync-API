/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const recieveMessageChunkAsync = /* GraphQL */ `subscription RecieveMessageChunkAsync($input: RecieveMessageChunkAsyncInput!) {
  recieveMessageChunkAsync(input: $input) {
    userId
    threadId
    status
    textChunk
    audioChunk
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.RecieveMessageChunkAsyncSubscriptionVariables,
  APITypes.RecieveMessageChunkAsyncSubscription
>;
