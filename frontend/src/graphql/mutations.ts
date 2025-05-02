/* tslint:disable */

// this is an auto generated file. This will be overwritten

import * as APITypes from '../API';
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createThread = /* GraphQL */ `mutation CreateThread($input: CreateThreadInput!) {
  createThread(input: $input) {
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
` as GeneratedMutation<APITypes.CreateThreadMutationVariables, APITypes.CreateThreadMutation>;
export const createMessageAsync =
  /* GraphQL */ `mutation CreateMessageAsync($input: CreateMessageInput!) {
  createMessageAsync(input: $input) {
    message {
      sender
      message
      audioClips
      createdAt
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<
    APITypes.CreateMessageAsyncMutationVariables,
    APITypes.CreateMessageAsyncMutation
  >;
export const createPersona = /* GraphQL */ `mutation CreatePersona($input: CreatePersonaInput!) {
  createPersona(input: $input) {
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      model
      knowledgeBaseId
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.CreatePersonaMutationVariables, APITypes.CreatePersonaMutation>;
export const updatePersona = /* GraphQL */ `mutation UpdatePersona($input: UpdatePersonaInput!) {
  updatePersona(input: $input) {
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      model
      knowledgeBaseId
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.UpdatePersonaMutationVariables, APITypes.UpdatePersonaMutation>;
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
export const deletePersona = /* GraphQL */ `mutation DeletePersona($input: DeletePersonaInput!) {
  deletePersona(input: $input) {
    persona {
      personaId
      name
      avatar
      prompt
      subtitle
      description
      color
      model
      knowledgeBaseId
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<APITypes.DeletePersonaMutationVariables, APITypes.DeletePersonaMutation>;
export const systemSendMessageChunk =
  /* GraphQL */ `mutation SystemSendMessageChunk($input: SystemSendMessageChunkInput!) {
  systemSendMessageChunk(input: $input) {
    userId
    threadId
    status
    chunkType
    chunk
    __typename
  }
}
` as GeneratedMutation<
    APITypes.SystemSendMessageChunkMutationVariables,
    APITypes.SystemSendMessageChunkMutation
  >;
