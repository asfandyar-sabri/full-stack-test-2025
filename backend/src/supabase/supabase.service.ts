// src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly url = process.env.SUPABASE_URL!;
  private readonly anon = process.env.SUPABASE_ANON_KEY!;
  // private readonly serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!; // if needed

  userClient(token: string): SupabaseClient {
    return createClient(this.url, this.anon, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: this.anon,
        },
      },
    });
  }
}
