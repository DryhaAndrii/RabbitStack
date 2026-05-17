import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_session_id";
export const LOGIN_PATH = "/login";
export const LOGOUT_PATH = "/logout";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (!hasAuthSession && pathname !== LOGIN_PATH) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAuthSession && pathname === LOGIN_PATH) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
