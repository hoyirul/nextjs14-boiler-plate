/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes } from "@/utils/response";
// bcrypt
import { hash } from "bcrypt";

// create user
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  // Hash password
  const hashedPassword = await hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    const newUser = result.rows[0];
    return successRes(201, "User created successfully", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return errorRes(500, "Failed to create user");
  }
}

// get all users
export async function GET(request: Request) {
  try {
    const result = await pool.query("SELECT id, name, email, created_at FROM users");
    const users = result.rows;
    return successRes(200, "Users fetched successfully", users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorRes(500, "Failed to fetch users");
  }
}
