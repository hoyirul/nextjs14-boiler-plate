/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes, valErrorRes } from "@/utils/response";
import { userCreateSchema } from "@/app/schemas/users/schema";
import { HTTP_MESSAGES, HTTP_STATUS } from "@/app/constants/http-status";
// bcrypt
import { hash } from "bcrypt";

// create user
export async function POST(request: Request) {
  const body = await request.json();

  // Validate request body
  const validation = userCreateSchema.safeParse(body);
  if (!validation.success) {
    return valErrorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, validation.error);
  }

  const { name, email, password } = validation.data;

  // Hash password
  const hashedPassword = await hash(password, process.env.HASH_SALT ? parseInt(process.env.HASH_SALT) : 12);

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if ((userExists.rowCount ?? 0) > 0) {
      return errorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, { email: "Email already exists" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    const newUser = result.rows[0];
    return successRes(HTTP_STATUS.CREATED, HTTP_MESSAGES.CREATED, newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}

// get all users
export async function GET(request: Request) {
  try {
    const result = await pool.query("SELECT id, name, email, created_at FROM users where deleted_at IS NULL");
    const users = result.rows;
    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}
