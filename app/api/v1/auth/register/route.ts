/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/auth/register/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes, valErrorRes } from "@/utils/response";
import { userCreateSchema } from "@/app/schemas/users/schema";
import { HTTP_STATUS, HTTP_MESSAGES } from "@/app/constants/http-status";
import { hash } from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body using Zod
    const result = userCreateSchema.safeParse(body);
    if (!result.success) {
      return valErrorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, result.error);
    }

    const { name, email, password } = result.data;

    // Check if email already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if ((existingUser.rowCount ?? 0) > 0) {
      return errorRes(HTTP_STATUS.BAD_REQUEST, "Email already in use", { email: "Email is taken" });
    }

    // Hash password
    const saltRounds = process.env.HASH_SALT ? parseInt(process.env.HASH_SALT) : 12;
    const hashedPassword = await hash(password, saltRounds);

    // Insert new user
    const newUserResult = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

    // Generate JWT
    const token = await new SignJWT({ id: newUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "1h")
      .sign(secret);

    // Store token in cookies (httpOnly for security)
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    // Final response
    const data = {
      user: newUser,
      token,
      token_type: "Bearer",
    };

    return successRes(HTTP_STATUS.CREATED, "User registered successfully", data);
  } catch (err) {
    console.error("Register error:", err);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, err);
  }
}
