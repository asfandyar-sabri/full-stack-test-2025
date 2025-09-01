// src/common/guards/supabase-auth.guard.ts
import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'] as string | undefined;
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    // support cookies (if same-origin) and query token (for SSE or cross-origin)
    const cookieToken = req.cookies?.['sb-access-token'] || req.cookies?.['access_token'];
    const queryToken = req.query?.['access_token'];

    const token = bearer || cookieToken || queryToken;
    if (!token) throw new UnauthorizedException('Missing access token');

    // Validate token with Supabase
    const client = this.supabase.userClient(token);
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) throw new UnauthorizedException('Invalid token');

    // Attach user + token for downstream use
    req.user = { id: user.id, email: user.email, token };
    return true;
    }
}
