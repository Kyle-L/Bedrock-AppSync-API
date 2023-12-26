/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from '../API';
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getPersona = /* GraphQL */ `query GetPersona($personaId: String!) {
  getPersona(personaId: $personaId) {
    personaId
    name
    avatar
    prompt
    subtitle
    description
    color
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
    __typename
  }
}
` as GeneratedQuery<APITypes.GetAllPersonasQueryVariables, APITypes.GetAllPersonasQuery>;
export const getThread = /* GraphQL */ `query GetThread($threadId: String!) {
  getThread(threadId: $threadId) {
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
` as GeneratedQuery<APITypes.GetThreadQueryVariables, APITypes.GetThreadQuery>;
export const getAllThreads = /* GraphQL */ `query GetAllThreads {
  getAllThreads {
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
` as GeneratedQuery<APITypes.GetAllThreadsQueryVariables, APITypes.GetAllThreadsQuery>;
