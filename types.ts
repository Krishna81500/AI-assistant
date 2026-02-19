
export enum AppMode {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  IMAGE = 'IMAGE',
  SEARCH = 'SEARCH',
  DASHBOARD = 'DASHBOARD'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  sources?: { title: string; uri: string }[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}
