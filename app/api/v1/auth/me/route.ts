/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/auth/me/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes } from "@/utils/response";
import { HTTP_STATUS, HTTP_MESSAGES } from "@/app/constants/http-status";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return errorRes(HTTP_STATUS.UNAUTHORIZED, HTTP_MESSAGES.UNAUTHORIZED, "No token provided");
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY not defined");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;

    const userResult = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return errorRes(HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, "User not found");
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, { user });
  } catch (err) {
    console.error("Me error:", err);
    return errorRes(HTTP_STATUS.UNAUTHORIZED, HTTP_MESSAGES.UNAUTHORIZED, "Invalid or expired token");
  }
}
