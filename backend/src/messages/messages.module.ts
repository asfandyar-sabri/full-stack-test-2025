import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [ChatsModule, LlmModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
