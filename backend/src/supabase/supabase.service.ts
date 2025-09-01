import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly url = process.env.SUPABASE_URL!;
  private readonly anon = process.env.SUPABASE_ANON_KEY!;
  private readonly serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  serviceClient(): SupabaseClient {
    return createClient(this.url, this.serviceRole);
  }

  userClient(accessToken: string): SupabaseClient {
    return createClient(this.url, this.anon, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
