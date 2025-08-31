/* 
  Author  : Mochammad Hairullah
  Path    : /middleware.ts
*/

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { errorRes } from "@/utils/response";
import { HTTP_STATUS, HTTP_MESSAGES } from "./app/constants/http-status";

// ✅ Public routes regex (all versions of login/register)
const PUBLIC_PATHS_REGEX = [
  /^\/auth\/(login|register)/,
  /^\/api\/v\d+\/auth\/(login|register)/,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  if (PUBLIC_PATHS_REGEX.some((rx) => rx.test(pathname))) {
    return NextResponse.next();
  }

  // ✅ Try to get token from cookie or Authorization header
  let token = req.cookies.get("token")?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  // ✅ If no token
  if (!token) {
    if (pathname.startsWith("/api")) {
      // API → balikin JSON Unauthorized
      return errorRes(HTTP_STATUS.UNAUTHORIZED, HTTP_MESSAGES.UNAUTHORIZED, "No token provided");
    } else {
      // Page → redirect ke login
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

    // ✅ Verify JWT
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (err) {
    console.error("JWT error:", err);

    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    } else {
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
