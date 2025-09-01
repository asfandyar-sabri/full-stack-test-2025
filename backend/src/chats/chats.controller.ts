import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(SupabaseAuthGuard)
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  async list(@Req() req: any) {
    return this.chats.listChats(req.user.token);
  }

  @Post()
  async create(@Req() req: any, @Body('title') title?: string) {
    return this.chats.createChat(req.user.token, req.user.id, title);
  }
}
