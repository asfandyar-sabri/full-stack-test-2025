// src/messages/messages.controller.ts
import {
  Controller, Get, Post, Param, Body, Sse, Query,
  UseGuards, MessageEvent, Req
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { LlmService } from '../llm/llm.service';
import { MessagesService } from './messages.service';
import { Observable, of, concat, map } from 'rxjs';

@UseGuards(SupabaseAuthGuard)
@Controller('/chats/:id/messages')
export class MessagesController {
  constructor(
    private readonly messages: MessagesService,
    private readonly llm: LlmService
  ) {}

  @Get()
  async list(@Param('id') id: string, @Req() req: any) {
    return this.messages.listByChat(req.user.token, id);
  }

  @Post()
  async create(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: any
  ) {
    const user = req.user;

    // 1) insert user message
    const userMsg = await this.messages.insert(user.token, {
      chat_id: id,
      user_id: user.id,
      role: 'user',
      content: body.content,
    });

    // 2) deterministic assistant reply so UI ALWAYS has a response
    const reply =
      `Here is a multi-sentence simulated AI reply to: "${body.content}". ` +
      `Imagine this came from a real LLM service. This delay helps you ` +
      `demonstrate proper long-running request handling on the frontend.`;

    const assistantMsg = await this.messages.insert(user.token, {
      chat_id: id,
      user_id: user.id,
      role: 'assistant',
      content: reply,
    });

    return { user: userMsg, assistant: assistantMsg };
  }

  // (kept for later if you want live streaming)
  @Sse('stream')
  stream(@Param('id') id: string, @Query('q') q: string): Observable<MessageEvent> {
    const text =
      'Here is a multi-sentence simulated AI reply. Imagine this came from a real LLM service. This streaming demo shows progressive delivery just like ChatGPT.';
    const tokens = text.split(' ');
    const pipe$ = this.llm.simulate(tokens).pipe(
      map((token) => ({ data: { type: 'token', token } }))
    );
    const done$ = of({ data: { type: 'done' } });
    return concat(pipe$, done$);
  }
}
