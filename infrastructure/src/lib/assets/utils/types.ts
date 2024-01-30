export interface EventType {
  userId: string;
  threadId: string;
  history: { sender: string; text: string }[];
  query: string;
  eventTimeout: number;
  persona: {
    voice: { name: string; style?: string };
    voiceStyle: string;
    model: string;
    knowledgeBaseId: string;
    prompt: string;
  };
  responseOptions: {
    includeAudio: boolean;
  };
  xrayTraceId?: string;
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
