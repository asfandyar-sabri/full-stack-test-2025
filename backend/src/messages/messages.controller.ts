import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from './messages.service';
import { LlmService } from '../llm/llm.service';

@Controller('chats/:id/messages')
@UseGuards(SupabaseAuthGuard)
export class MessagesController {
  constructor(
    private readonly chats: ChatsService,
    private readonly messages: MessagesService,
    private readonly llm: LlmService,
  ) {}

  @Get()
  async list(@Req() req: any, @Param('id') chatId: string) {
    await this.chats.assertOwner(req.user.token, chatId);
    return this.messages.listByChat(req.user.token, chatId);
  }

  @Post()
  async send(@Req() req: any, @Param('id') chatId: string, @Body('content') content: string) {
    const { id: userId, token } = req.user;

    // Verify ownership
    await this.chats.assertOwner(token, chatId);

    // Save user message
    await this.messages.insert(token, { chat_id: chatId, user_id: userId, role: 'user', content });

    // Simulate LLM 10–20s
    const reply = await this.llm.getSimulatedReply(content);

    // Save assistant message
    const assistant = await this.messages.insert(token, {
      chat_id: chatId, user_id: userId, role: 'assistant', content: reply,
    });

    return assistant;
  }
}
