export type CallState = 'idle' | 'calling' | 'connected' | 'ended';

export interface Message {
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}