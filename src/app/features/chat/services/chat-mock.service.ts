import { Injectable } from '@angular/core';

export interface ChatSession {
  id: number;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatMockService {
  private readonly sessions: ChatSession[] = [
    { id: 1, title: 'Current session', updatedAt: 'Just now' },
    { id: 2, title: 'Search relevance tuning', updatedAt: '12 min ago' },
    { id: 3, title: 'Document parsing ideas', updatedAt: 'Yesterday' },
  ];

  private readonly assistantResponses = [
    'I can help summarize that and suggest the next action.',
    'Here is a mock AI response showing how streamed answers could appear.',
    'This workspace is ready for backend model integration when you are.',
  ];

  getSessions(): ChatSession[] {
    return this.sessions;
  }

  getInitialMessages(): ChatMessage[] {
    return [
      { role: 'user', content: 'Show me how the AI conversation area will work.' },
      {
        role: 'assistant',
        content: 'This is a mock conversation thread. Messages here will later come from a real AI service.',
      },
    ];
  }

  sendMessage(prompt: string): ChatMessage[] {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return [];
    }

    const response =
      this.assistantResponses[trimmedPrompt.length % this.assistantResponses.length];

    return [
      { role: 'user', content: trimmedPrompt },
      { role: 'assistant', content: response },
    ];
  }
}
