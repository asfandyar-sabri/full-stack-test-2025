import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing token');

    // Let Supabase verify the JWT and return the user
    const admin = this.supabase.serviceClient();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) {
      throw new ForbiddenException('Invalid token');
    }

    // Attach user + token (we still need the token for RLS userClient)
    req.user = {
      id: data.user.id,
      email: data.user.email,
      token,
    };

    return true;
  }
}
