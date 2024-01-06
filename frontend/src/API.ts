/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Thread = {
  __typename: "Thread",
  userId?: string | null,
  threadId?: string | null,
  data?:  Array<Message > | null,
  status?: Status | null,
  persona: Persona,
};

export type Message = {
  __typename: "Message",
  sender: string,
  text: string,
};

export enum Status {
  NEW = "NEW",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETE = "COMPLETE",
}


export type Persona = {
  __typename: "Persona",
  personaId: string,
  name: string,
  avatar: string,
  prompt: string,
  subtitle?: string | null,
  description?: string | null,
  color?: string | null,
  model?: string | null,
};

export type MessageChunk = {
  __typename: "MessageChunk",
  userId: string,
  threadId: string,
  data: string,
  status: Status,
};

export type MessageInput = {
  sender: string,
  text: string,
};

export type AddThreadMutationVariables = {
  personaId: string,
};

export type AddThreadMutation = {
  addThread?:  {
    __typename: "Thread",
    userId?: string | null,
    threadId?: string | null,
    data?:  Array< {
      __typename: "Message",
      sender: string,
      text: string,
    } > | null,
    status?: Status | null,
    persona:  {
      __typename: "Persona",
      personaId: string,
      name: string,
      avatar: string,
      prompt: string,
      subtitle?: string | null,
      description?: string | null,
      color?: string | null,
      model?: string | null,
    },
  } | null,
};

export type DeleteThreadMutationVariables = {
  threadId: string,
};

export type DeleteThreadMutation = {
  deleteThread?:  {
    __typename: "Thread",
    userId?: string | null,
    threadId?: string | null,
    data?:  Array< {
      __typename: "Message",
      sender: string,
      text: string,
    } > | null,
    status?: Status | null,
    persona:  {
      __typename: "Persona",
      personaId: string,
      name: string,
      avatar: string,
      prompt: string,
      subtitle?: string | null,
      description?: string | null,
      color?: string | null,
      model?: string | null,
    },
  } | null,
};

export type AddMessageAsyncMutationVariables = {
  threadId: string,
  prompt: string,
};

export type AddMessageAsyncMutation = {
  addMessageAsync?:  {
    __typename: "Message",
    sender: string,
    text: string,
  } | null,
};

export type AddVoiceMutationVariables = {
  personaId?: string | null,
  message: string,
};

export type AddVoiceMutation = {
  addVoice?: string | null,
};

export type SendMessageChunkMutationVariables = {
  userId: string,
  threadId: string,
  status: Status,
  data: string,
};

export type SendMessageChunkMutation = {
  sendMessageChunk?:  {
    __typename: "MessageChunk",
    userId: string,
    threadId: string,
    data: string,
    status: Status,
  } | null,
};

export type AddMessageSystemMutationVariables = {
  userId: string,
  threadId: string,
  status: Status,
  message: MessageInput,
};

export type AddMessageSystemMutation = {
  addMessageSystem?:  {
    __typename: "Thread",
    userId?: string | null,
    threadId?: string | null,
    data?:  Array< {
      __typename: "Message",
      sender: string,
      text: string,
    } > | null,
    status?: Status | null,
    persona:  {
      __typename: "Persona",
      personaId: string,
      name: string,
      avatar: string,
      prompt: string,
      subtitle?: string | null,
      description?: string | null,
      color?: string | null,
      model?: string | null,
    },
  } | null,
};

export type GetPersonaQueryVariables = {
  personaId: string,
};

export type GetPersonaQuery = {
  getPersona?:  {
    __typename: "Persona",
    personaId: string,
    name: string,
    avatar: string,
    prompt: string,
    subtitle?: string | null,
    description?: string | null,
    color?: string | null,
    model?: string | null,
  } | null,
};

export type GetAllPersonasQueryVariables = {
};

export type GetAllPersonasQuery = {
  getAllPersonas?:  Array< {
    __typename: "Persona",
    personaId: string,
    name: string,
    avatar: string,
    prompt: string,
    subtitle?: string | null,
    description?: string | null,
    color?: string | null,
    model?: string | null,
  } > | null,
};

export type GetThreadQueryVariables = {
  threadId: string,
};

export type GetThreadQuery = {
  getThread?:  {
    __typename: "Thread",
    userId?: string | null,
    threadId?: string | null,
    data?:  Array< {
      __typename: "Message",
      sender: string,
      text: string,
    } > | null,
    status?: Status | null,
    persona:  {
      __typename: "Persona",
      personaId: string,
      name: string,
      avatar: string,
      prompt: string,
      subtitle?: string | null,
      description?: string | null,
      color?: string | null,
      model?: string | null,
    },
  } | null,
};

export type GetAllThreadsQueryVariables = {
};

export type GetAllThreadsQuery = {
  getAllThreads?:  Array< {
    __typename: "Thread",
    userId?: string | null,
    threadId?: string | null,
    data?:  Array< {
      __typename: "Message",
      sender: string,
      text: string,
    } > | null,
    status?: Status | null,
    persona:  {
      __typename: "Persona",
      personaId: string,
      name: string,
      avatar: string,
      prompt: string,
      subtitle?: string | null,
      description?: string | null,
      color?: string | null,
      model?: string | null,
    },
  } > | null,
};

export type RecieveMessageChunkAsyncSubscriptionVariables = {
  threadId: string,
};

export type RecieveMessageChunkAsyncSubscription = {
  recieveMessageChunkAsync?:  {
    __typename: "MessageChunk",
    userId: string,
    threadId: string,
    data: string,
    status: Status,
  } | null,
};
