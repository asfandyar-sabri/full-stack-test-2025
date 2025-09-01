import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatsService {
  constructor(private readonly supabase: SupabaseService) {}

  userClient(token: string) {
    return this.supabase.userClient(token);
  }

  async listChats(token: string) {
    const client = this.userClient(token);
    const { data, error } = await client.from('chats')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createChat(token: string, userId: string, title = 'New Chat') {
    const client = this.userClient(token);
    const { data, error } = await client.from('chats')
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async assertOwner(token: string, chatId: string) {
    const client = this.userClient(token);
    const { data, error } = await client.from('chats')
      .select('id')
      .eq('id', chatId)
      .single();
    if (error || !data) throw new ForbiddenException('Not your chat or not found');
    return true;
  }
}
