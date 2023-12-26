/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from '../API';
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const addThread = /* GraphQL */ `mutation AddThread($personaId: String!) {
  addThread(personaId: $personaId) {
    userId
    threadId
    data {
      sender
      text
      __typename
    }
    status
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.AddThreadMutationVariables, APITypes.AddThreadMutation>;
export const deleteThread = /* GraphQL */ `mutation DeleteThread($threadId: String!) {
  deleteThread(threadId: $threadId) {
    userId
    threadId
    data {
      sender
      text
      __typename
    }
    status
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.DeleteThreadMutationVariables, APITypes.DeleteThreadMutation>;
export const addMessageAsync =
  /* GraphQL */ `mutation AddMessageAsync($threadId: String!, $prompt: String!) {
  addMessageAsync(threadId: $threadId, prompt: $prompt) {
    userId
    threadId
    data {
      sender
      text
      __typename
    }
    status
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.AddMessageAsyncMutationVariables, APITypes.AddMessageAsyncMutation>;
export const sendMessageChunk = /* GraphQL */ `mutation SendMessageChunk(
  $userId: String!
  $threadId: String!
  $status: Status!
  $data: String!
) {
  sendMessageChunk(
    userId: $userId
    threadId: $threadId
    status: $status
    data: $data
  ) {
    userId
    threadId
    data
    status
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SendMessageChunkMutationVariables,
  APITypes.SendMessageChunkMutation
>;
export const addMessageSystem = /* GraphQL */ `mutation AddMessageSystem(
  $userId: String!
  $threadId: String!
  $status: Status!
  $message: MessageInput!
) {
  addMessageSystem(
    userId: $userId
    threadId: $threadId
    status: $status
    message: $message
  ) {
    userId
    threadId
    data {
      sender
      text
      __typename
    }
    status
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AddMessageSystemMutationVariables,
  APITypes.AddMessageSystemMutation
>;
