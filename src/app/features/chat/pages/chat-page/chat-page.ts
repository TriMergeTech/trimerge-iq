import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChatMessage,
  ChatMockService,
  ChatSession,
} from '../../services/chat-mock.service';

interface SuggestedPrompt {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-chat-page',
  imports: [FormsModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
})
export class ChatPage {
  private readonly chatService = inject(ChatMockService);

  prompt = '';
  isTyping = false;
  sessions: ChatSession[] = this.chatService.getSessions();
  messages: ChatMessage[] = [];

  readonly suggestedPrompts: SuggestedPrompt[] = [
    { label: 'Tell me about your strategic consulting services', icon: '◎' },
    { label: 'How can you help with digital transformation?', icon: '⚡' },
    { label: 'What is your approach to operational excellence?', icon: '↗' },
    { label: 'What industries do you serve?', icon: '✦' },
  ];

  constructor() {
    this.startNewChat();
  }

  startNewChat(): void {
    this.messages = this.chatService.getInitialMessages();
    this.prompt = '';
    this.isTyping = false;
  }

  applyPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  handleKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) {
      return;
    }

    keyboardEvent.preventDefault();
    this.send();
  }

  send(): void {
    const trimmedPrompt = this.prompt.trim();
    if (!trimmedPrompt || this.isTyping) {
      return;
    }

    this.isTyping = true;
    const nextMessages = this.chatService.sendMessage(trimmedPrompt);
    this.messages = [...this.messages, { role: 'user', content: trimmedPrompt }];
    this.prompt = '';

    setTimeout(() => {
      this.messages = [...this.messages, nextMessages[1]];
      this.isTyping = false;
    }, 900);
  }
}
