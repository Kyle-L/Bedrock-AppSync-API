export interface EventType {
  userId: string;
  threadId: string;
  history: string;
  query: string;
  eventTimeout: number;
  persona: {
    voice: string;
    model: string;
    knowledgeBaseId: string;
    prompt: string;
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
  COMPLETE = 'COMPLETE'
}
