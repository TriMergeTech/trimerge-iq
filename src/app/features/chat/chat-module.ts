import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing-module';
import { ChatPage } from './pages/chat-page/chat-page';

@NgModule({
  imports: [CommonModule, ChatRoutingModule, ChatPage],
})
export class ChatModule {}
