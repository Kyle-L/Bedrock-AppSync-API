export interface EventType {
  userId: string;
  threadId: string;
  history: string;
  query: string;
  promptTemplate: string;
  eventTimeout: number;
  model: string;
  knowledgeBaseId: string;
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
