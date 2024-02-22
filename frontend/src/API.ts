/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateThreadInput = {
  personaId: string;
};

export type CreateThreadPayload = {
  __typename: 'CreateThreadPayload';
  thread?: Thread | null;
};

export type Thread = {
  __typename: 'Thread';
  threadId: string;
  userId: string;
  persona: Persona;
  messages?: Array<Message> | null;
  status: ThreadStatus;
  createdAt: string;
};

export type Persona = {
  __typename: 'Persona';
  personaId: string;
  name: string;
  avatar?: string | null;
  prompt?: string | null;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  model?: string | null;
  knowledgeBaseId?: string | null;
  voice?: Voice | null;
};

export type Voice = {
  __typename: 'Voice';
  id: string;
};

export type Message = {
  __typename: 'Message';
  sender: string;
  message: string;
  audioClips?: Array<string> | null;
  createdAt: string;
};

export enum ThreadStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export type CreateMessageInput = {
  threadId: string;
  prompt: string;
  includeAudio?: boolean | null;
};

export type CreateMessagePayload = {
  __typename: 'CreateMessagePayload';
  message?: Message | null;
};

export type CreatePersonaInput = {
  name: string;
  avatar?: string | null;
  prompt?: string | null;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  model?: string | null;
  knowledgeBaseId?: string | null;
  voice?: VoiceInput | null;
};

export type VoiceInput = {
  id: string;
};

export type CreatePersonaPayload = {
  __typename: 'CreatePersonaPayload';
  persona?: Persona | null;
};

export type UpdatePersonaInput = {
  personaId: string;
  name: string;
  avatar?: string | null;
  prompt?: string | null;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  model?: string | null;
  knowledgeBaseId?: string | null;
  voice?: VoiceInput | null;
};

export type UpdatePersonaPayload = {
  __typename: 'UpdatePersonaPayload';
  persona?: Persona | null;
};

export type DeleteThreadInput = {
  threadId: string;
};

export type DeleteThreadPayload = {
  __typename: 'DeleteThreadPayload';
  thread?: Thread | null;
};

export type DeletePersonaInput = {
  personaId: string;
};

export type DeletePersonaPayload = {
  __typename: 'DeletePersonaPayload';
  persona?: Persona | null;
};

export type SystemSendMessageChunkInput = {
  userId: string;
  threadId: string;
  status: ThreadStatus;
  chunkType: string;
  chunk: string;
};

export type MessageChunk = {
  __typename: 'MessageChunk';
  userId: string;
  threadId: string;
  status: ThreadStatus;
  chunkType: string;
  chunk: string;
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

export type CreateThreadMutationVariables = {
  input: CreateThreadInput;
};

export type CreateThreadMutation = {
  createThread?: {
    __typename: 'CreateThreadPayload';
    thread?: {
      __typename: 'Thread';
      threadId: string;
      userId: string;
      status: ThreadStatus;
      createdAt: string;
    } | null;
  } | null;
};

export type CreateMessageAsyncMutationVariables = {
  input: CreateMessageInput;
};

export type CreateMessageAsyncMutation = {
  createMessageAsync?: {
    __typename: 'CreateMessagePayload';
    message?: {
      __typename: 'Message';
      sender: string;
      message: string;
      audioClips?: Array<string> | null;
      createdAt: string;
    } | null;
  } | null;
};

export type CreatePersonaMutationVariables = {
  input: CreatePersonaInput;
};

export type CreatePersonaMutation = {
  createPersona?: {
    __typename: 'CreatePersonaPayload';
    persona?: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar?: string | null;
      prompt?: string | null;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
      knowledgeBaseId?: string | null;
    } | null;
  } | null;
};

export type UpdatePersonaMutationVariables = {
  input: UpdatePersonaInput;
};

export type UpdatePersonaMutation = {
  updatePersona?: {
    __typename: 'UpdatePersonaPayload';
    persona?: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar?: string | null;
      prompt?: string | null;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
      knowledgeBaseId?: string | null;
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
      status: ThreadStatus;
      createdAt: string;
    } | null;
  } | null;
};

export type DeletePersonaMutationVariables = {
  input: DeletePersonaInput;
};

export type DeletePersonaMutation = {
  deletePersona?: {
    __typename: 'DeletePersonaPayload';
    persona?: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar?: string | null;
      prompt?: string | null;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
      knowledgeBaseId?: string | null;
    } | null;
  } | null;
};

export type SystemSendMessageChunkMutationVariables = {
  input: SystemSendMessageChunkInput;
};

export type SystemSendMessageChunkMutation = {
  systemSendMessageChunk?: {
    __typename: 'MessageChunk';
    userId: string;
    threadId: string;
    status: ThreadStatus;
    chunkType: string;
    chunk: string;
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
    avatar?: string | null;
    prompt?: string | null;
    subtitle?: string | null;
    description?: string | null;
    color?: string | null;
    model?: string | null;
    knowledgeBaseId?: string | null;
    voice?: {
      __typename: 'Voice';
      id: string;
    } | null;
  } | null;
};

export type GetAllPersonasQueryVariables = {};

export type GetAllPersonasQuery = {
  getAllPersonas?: Array<{
    __typename: 'Persona';
    personaId: string;
    name: string;
    avatar?: string | null;
    prompt?: string | null;
    subtitle?: string | null;
    description?: string | null;
    color?: string | null;
    model?: string | null;
    knowledgeBaseId?: string | null;
    voice?: {
      __typename: 'Voice';
      id: string;
    } | null;
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
    persona: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar?: string | null;
      prompt?: string | null;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
      knowledgeBaseId?: string | null;
    };
    messages?: Array<{
      __typename: 'Message';
      sender: string;
      message: string;
      audioClips?: Array<string> | null;
      createdAt: string;
    }> | null;
    status: ThreadStatus;
    createdAt: string;
  } | null;
};

export type GetAllThreadsQueryVariables = {};

export type GetAllThreadsQuery = {
  getAllThreads?: Array<{
    __typename: 'Thread';
    threadId: string;
    userId: string;
    persona: {
      __typename: 'Persona';
      personaId: string;
      name: string;
      avatar?: string | null;
      prompt?: string | null;
      subtitle?: string | null;
      description?: string | null;
      color?: string | null;
      model?: string | null;
      knowledgeBaseId?: string | null;
    };
    messages?: Array<{
      __typename: 'Message';
      sender: string;
      message: string;
      audioClips?: Array<string> | null;
      createdAt: string;
    }> | null;
    status: ThreadStatus;
    createdAt: string;
  }> | null;
};

export type RecieveMessageChunkAsyncSubscriptionVariables = {
  input: RecieveMessageChunkAsyncInput;
};

export type RecieveMessageChunkAsyncSubscription = {
  recieveMessageChunkAsync?: {
    __typename: 'MessageChunk';
    userId: string;
    threadId: string;
    status: ThreadStatus;
    chunkType: string;
    chunk: string;
  } | null;
};
