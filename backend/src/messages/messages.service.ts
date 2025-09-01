// src/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

type Role = 'user' | 'assistant';

@Injectable()
export class MessagesService {
  constructor(private readonly supabase: SupabaseService) {}

  userClient(token: string) {
    return this.supabase.userClient(token);
  }

  async listByChat(token: string, chatId: string) {
    const client = this.userClient(token);
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true }); // oldest -> newest
    if (error) throw error;
    return data ?? [];
  }

  async insert(
    token: string,
    payload: { chat_id: string; user_id: string; role: Role; content: string }
  ) {
    const client = this.userClient(token);
    const { data, error } = await client
      .from('messages')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
