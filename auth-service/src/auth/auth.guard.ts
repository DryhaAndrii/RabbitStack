import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { SessionService } from '../sessions/session.service';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { IS_PUBLIC_KEY } from './auth.decorators';

type RequestWithAuth = Request & {
  authSession?: Record<string, unknown>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const response = context.switchToHttp().getResponse<Response>();

    if (request.method === 'OPTIONS') {
      return true;
    }

    const sessionId = this.extractCookieValue(
      request.headers.cookie,
      AUTH_COOKIE_NAME,
    );

    if (!sessionId) {
      this.clearAuthCookie(response);
      throw new UnauthorizedException('Authentication required');
    }

    const session = await this.sessionService.getAuthSession(sessionId);

    if (!session) {
      this.clearAuthCookie(response);
      throw new UnauthorizedException('Authentication session expired');
    }

    request.authSession = session;
    return true;
  }

  private extractCookieValue(
    cookieHeader: string | undefined,
    cookieName: string,
  ): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
      const [rawName, ...rawValue] = cookie.trim().split('=');

      if (rawName === cookieName) {
        return decodeURIComponent(rawValue.join('='));
      }
    }

    return null;
  }

  private clearAuthCookie(response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
  }
}
