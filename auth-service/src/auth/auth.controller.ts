import { Body, Controller, Headers, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME } from "./auth.constants";
import { Public } from "./auth.decorators";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(
    @Body() body: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body);
    this.setAuthCookie(response, result.sessionId);

    return {
      ok: true,
      message: "Account registered successfully",
      account: result.account,
    };
  }

  @Public()
  @Post("login")
  async login(
    @Body() body: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);
    this.setAuthCookie(response, result.sessionId);

    return {
      ok: true,
      message: "Account logged in successfully",
      account: result.account,
    };
  }

  @Public()
  @Post("logout")
  async logout(
    @Headers("cookie") cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = this.extractCookieValue(cookieHeader, AUTH_COOKIE_NAME);
    await this.authService.logout(sessionId);
    this.clearAuthCookie(response);

    return {
      ok: true,
      message: "Account logged out successfully",
    };
  }

  private setAuthCookie(response: Response, sessionId: string) {
    response.cookie(AUTH_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });
  }

  private clearAuthCookie(response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  }

  private extractCookieValue(
    cookieHeader: string | undefined,
    cookieName: string,
  ): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
      const [rawName, ...rawValue] = cookie.trim().split("=");

      if (rawName === cookieName) {
        return decodeURIComponent(rawValue.join("="));
      }
    }

    return null;
  }
}
