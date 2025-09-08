// src/common/guards/supabase-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Allow CORS preflight without auth
    if (req.method === 'OPTIONS') return true;

    // Normalize Authorization header (string | string[]) and case-insensitive scheme
    const authHeaderRaw = req.headers['authorization'];
    const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;

    let bearer: string | undefined;
    if (typeof authHeader === 'string') {
      const lower = authHeader.toLowerCase();
      if (lower.startsWith('bearer ')) {
        bearer = authHeader.slice(7).trim();
      }
    }

    // Support Supabase cookie or custom cookie names if same-origin
    const cookieToken: string | undefined =
      req.cookies?.['sb-access-token'] || req.cookies?.['access_token'];

    // Support query param (useful for SSE EventSource which can't send Authorization)
    const queryTokenRaw = req.query?.['access_token'];
    const queryToken: string | undefined = Array.isArray(queryTokenRaw)
      ? queryTokenRaw[0]
      : (queryTokenRaw as string | undefined);

    const token = bearer || cookieToken || queryToken;
    if (!token) throw new UnauthorizedException('Missing access token');

    // Validate token with Supabase
    try {
      const client = this.supabase.userClient(token);
      const { data, error } = await client.auth.getUser();
      const user = data?.user;

      if (error || !user) throw new UnauthorizedException('Invalid token');

      // Attach user + token for downstream use
      req.user = { id: user.id, email: user.email, token };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
