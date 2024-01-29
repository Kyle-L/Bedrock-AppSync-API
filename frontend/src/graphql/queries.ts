/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from '../API';
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getPersona = /* GraphQL */ `query GetPersona($input: GetPersonaInput!) {
  getPersona(input: $input) {
    personaId
    name
    avatar
    prompt
    subtitle
    description
    color
    model
    knowledgeBaseId
    voice {
      name
      style
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<APITypes.GetPersonaQueryVariables, APITypes.GetPersonaQuery>;
export const getAllPersonas = /* GraphQL */ `query GetAllPersonas {
  getAllPersonas {
    personaId
    name
    avatar
    prompt
    subtitle
    description
    color
    model
    knowledgeBaseId
    voice {
      name
      style
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<APITypes.GetAllPersonasQueryVariables, APITypes.GetAllPersonasQuery>;
export const getThread = /* GraphQL */ `query GetThread($input: GetThreadInput!) {
  getThread(input: $input) {
    threadId
    userId
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
    messages {
      sender
      message
      createdAt
      __typename
    }
    status
    createdAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetThreadQueryVariables, APITypes.GetThreadQuery>;
export const getAllThreads = /* GraphQL */ `query GetAllThreads {
  getAllThreads {
    threadId
    userId
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
    messages {
      sender
      message
      createdAt
      __typename
    }
    status
    createdAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetAllThreadsQueryVariables, APITypes.GetAllThreadsQuery>;
