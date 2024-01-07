/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from '../API';
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const addThread = /* GraphQL */ `mutation AddThread($input: AddThreadInput!) {
  addThread(input: $input) {
    thread {
      threadId
      userId
      status
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.AddThreadMutationVariables, APITypes.AddThreadMutation>;
export const addMessageAsync = /* GraphQL */ `mutation AddMessageAsync($input: AddMessageInput!) {
  addMessageAsync(input: $input) {
    message {
      sender
      message
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.AddMessageAsyncMutationVariables, APITypes.AddMessageAsyncMutation>;
export const addVoice = /* GraphQL */ `mutation AddVoice($input: AddVoiceInput!) {
  addVoice(input: $input) {
    message {
      sender
      message
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.AddVoiceMutationVariables, APITypes.AddVoiceMutation>;
export const deleteThread = /* GraphQL */ `mutation DeleteThread($input: DeleteThreadInput!) {
  deleteThread(input: $input) {
    thread {
      threadId
      userId
      status
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.DeleteThreadMutationVariables, APITypes.DeleteThreadMutation>;
export const systemSendMessageChunk =
  /* GraphQL */ `mutation SystemSendMessageChunk($input: SystemSendMessageChunkInput!) {
  systemSendMessageChunk(input: $input) {
    userId
    threadId
    status
    chunk
    __typename
  }
}
` as GeneratedMutation<
    APITypes.SystemSendMessageChunkMutationVariables,
    APITypes.SystemSendMessageChunkMutation
  >;
export const systemAddMessage =
  /* GraphQL */ `mutation SystemAddMessage($input: SystemAddMessageInput!) {
  systemAddMessage(input: $input) {
    message {
      sender
      message
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<
    APITypes.SystemAddMessageMutationVariables,
    APITypes.SystemAddMessageMutation
  >;
