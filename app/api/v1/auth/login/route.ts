/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/auth/login/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes, valErrorRes } from "@/utils/response";
import { loginSchema } from "@/app/schemas/auth/schema";
import { HTTP_MESSAGES, HTTP_STATUS } from "@/app/constants/http-status";
import { compareSync } from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return valErrorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, result.error);
    }

    const { email, password } = result.data;

    // Find user in database
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      return errorRes(HTTP_STATUS.NOT_FOUND, HTTP_MESSAGES.NOT_FOUND, {
        email: "User not found",
      });
    }

    // Compare password
    const isValid = compareSync(password, user.password);
    if (!isValid) {
      return errorRes(HTTP_STATUS.UNAUTHORIZED, HTTP_MESSAGES.UNAUTHORIZED, {
        password: "Invalid password",
      });
    }

    // Ensure secret key exists
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

    // Sign JWT token
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "1h")
      .sign(secret);

    // Set token into cookies (httpOnly for security)
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    // Response payload
    const data = {
      user: {
        id: user.id,
        email: user.email,
      },
      token_type: "Bearer",
      token,
    };

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, data);
  } catch (err) {
    console.error("Login error:", err);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, err);
  }
}
