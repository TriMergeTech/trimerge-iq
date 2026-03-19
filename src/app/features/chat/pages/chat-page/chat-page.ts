import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChatMessage,
  ChatMockService,
  ChatSession,
} from '../../services/chat-mock.service';

@Component({
  selector: 'app-chat-page',
  imports: [FormsModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
})
export class ChatPage {
  private readonly chatService = inject(ChatMockService);

  prompt = '';
  sessions: ChatSession[] = this.chatService.getSessions();
  messages: ChatMessage[] = this.chatService.getInitialMessages();

  startNewChat(): void {
    this.messages = [
      {
        role: 'assistant',
        content: 'New mock chat started. This is where a fresh AI session would begin.',
      },
    ];
    this.prompt = '';
  }

  send(): void {
    const nextMessages = this.chatService.sendMessage(this.prompt);

    if (!nextMessages.length) {
      return;
    }

    this.messages = [...this.messages, ...nextMessages];
    this.prompt = '';
  }
}
