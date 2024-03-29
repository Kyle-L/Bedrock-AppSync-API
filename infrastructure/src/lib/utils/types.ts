export interface Persona {
  voice: { id: string };
  voiceStyle: string;
  model: string;
  knowledgeBaseId: string;
  prompt: string;
}

export interface EventType {
  userId: string;
  threadId: string;
  history: { sender: string; message: string }[];
  query: string;
  eventTimeout: number;
  persona: Persona;
  responseOptions: {
    includeAudio: boolean;
  };
}

export interface EventResult {
  sender: string;
  message: string;
}

export enum MessageSystemStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
