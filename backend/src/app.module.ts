import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { LlmModule } from './llm/llm.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    SupabaseModule,
    ChatsModule,
    MessagesModule,
    LlmModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
