/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type AddThreadInput = {
  personaId: string;
};

export type AddThreadPayload = {
  __typename: 'AddThreadPayload';
  thread?: Thread | null;
};

export type Thread = {
  __typename: 'Thread';
  threadId: string;
  userId: string;
  messages?: Array<Message> | null;
  status?: ThreadStatus | null;
  persona: Persona;
};

export type Message = {
  __typename: 'Message';
  sender: string;
  message: string;
};

export enum ThreadStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export type Persona = {
  __typename: 'Persona';
  personaId: string;
  name: string;
  avatar: string;
  prompt: string;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  model?: string | null;
};

export type AddMessageInput = {
  threadId: string;
  prompt: string;
};

export type AddMessagePayload = {
  __typename: 'AddMessagePayload';
  message?: Message | null;
};

export type AddVoiceInput = {
  personaId: string;
  message: string;
};

export type AddVoicePayload = {
  __typename: 'AddVoicePayload';
  message?: Message | null;
};

export type DeleteThreadInput = {
  threadId: string;
};

export type DeleteThreadPayload = {
  __typename: 'DeleteThreadPayload';
  thread?: Thread | null;
};

export type SystemSendMessageChunkInput = {
  userId: string;
  threadId: string;
  status: ThreadStatus;
  chunk: string;
};

export type SystemSendMessageChunkPayload = {
  __typename: 'SystemSendMessageChunkPayload';
  userId: string;
  threadId: string;
  status: ThreadStatus;
  chunk: string;
};

export type SystemAddMessageInput = {
  userId: string;
  threadId: string;
  status: ThreadStatus;
  message: MessageInput;
};

export type MessageInput = {
  sender: string;
  message: string;
};

export type SystemAddMessagePayload = {
  __typename: 'SystemAddMessagePayload';
  message?: Message | null;
};

export type GetPersonaInput = {
  personaId: string;
};

export type GetThreadInput = {
  threadId: string;
};

export type RecieveMessageChunkAsyncInput = {
  threadId: string;
};

export type AddThreadMutationVariables = {
  input: AddThreadInput;
};

export type AddThreadMutation = {
  addThread?: {
    __typename: 'AddThreadPayload';
    thread?: {
      __typename: 'Thread';
      threadId: string;
      userId: string;
      status?: ThreadStatus | null;
    } | null;
  } | null;
};

export type AddMessageAsyncMutationVariables = {
  input: AddMessageInput;
};

export type AddMessageAsyncMutation = {
  addMessageAsync?: {
    __typename: 'AddMessagePayload';
    message?: {
      __typename: 'Message';
      sender: string;
      message: string;
    } | null;
  } | null;
};

export type AddVoiceMutationVariables = {
  input: AddVoiceInput;
};

export type AddVoiceMutation = {
  addVoice?: {
    __typename: 'AddVoicePayload';
    message?: {
      __typename: 'Message';
      sender: string;
      message: string;
    } | null;
  } | null;
};

export type DeleteThreadMutationVariables = {
  input: DeleteThreadInput;
};

export type DeleteThreadMutation = {
  deleteThread?: {
    __typename: 'DeleteThreadPayload';
    thread?: {
      __typename: 'Thread';
      threadId: string;
      userId: string;
      status?: ThreadStatus | null;
    } | null;
  } | null;
};

export type SystemSendMessageChunkMutationVariables = {
  input: SystemSendMessageChunkInput;
};

export type SystemSendMessageChunkMutation = {
  systemSendMessageChunk?: {
    __typename: 'SystemSendMessageChunkPayload';
    userId: string;
    threadId: string;
    status: ThreadStatus;
    chunk: string;
  } | null;
};

export type SystemAddMessageMutationVariables = {
  input: SystemAddMessageInput;
};

export type SystemAddMessageMutation = {
  systemAddMessage?: {
    __typename: 'SystemAddMessagePayload';
    message?: {
      __typename: 'Message';
      sender: string;
      message: string;
    } | null;
  } | null;
};

export type GetPersonaQueryVariables = {
  input: GetPersonaInput;
};

export type GetPersonaQuery = {
  getPersona?: {
    __typename: 'Persona';
    personaId: string;
    name: string;
    avatar: string;
    prompt: string;
    subtitle?: string | null;
    description?: string | null;
    color?: string | null;
    model?: string | null;
  } | null;
};

export type GetAllPersonasQueryVariables = {};

export type GetAllPersonasQuery = {
  getAllPersonas?: Array<{
    __typename: 'Persona';
    personaId: string;
    name: string;
    avatar: string;
    prompt: string;
    subtitle?: string | null;
    description?: string | null;
    color?: string | null;
    model?: string | null;
  }> | null;
};

export type GetThreadQueryVariables = {
  input: GetThreadInput;
};

export type GetThreadQuery = {
  getThread?: {
    __typename: 'Thread';
    threadId: string;
    userId: string;
    messages?: Array<{
      __typename: 'Message';
      sender: string;
      message: string;
    }> | null;
    status?: ThreadStatus | null;
    persona: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar: string;
      prompt: string;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
    };
  } | null;
};

export type GetAllThreadsQueryVariables = {};

export type GetAllThreadsQuery = {
  getAllThreads?: Array<{
    __typename: 'Thread';
    threadId: string;
    userId: string;
    messages?: Array<{
      __typename: 'Message';
      sender: string;
      message: string;
    }> | null;
    status?: ThreadStatus | null;
    persona: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar: string;
      prompt: string;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
    };
  }> | null;
};

export type RecieveMessageChunkAsyncSubscriptionVariables = {
  input: RecieveMessageChunkAsyncInput;
};

export type RecieveMessageChunkAsyncSubscription = {
  recieveMessageChunkAsync?: {
    __typename: 'SystemSendMessageChunkPayload';
    userId: string;
    threadId: string;
    status: ThreadStatus;
    chunk: string;
  } | null;
};
