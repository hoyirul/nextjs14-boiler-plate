/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/[id]/route.ts
*/

import { successRes, errorRes, valErrorRes } from "@/utils/response";
import { HTTP_STATUS, HTTP_MESSAGES } from "@/app/constants/http-status";
import pool from "@/lib/db";
import { hash } from "bcrypt";
import { userUpdateSchema } from "@/app/schemas/users/schema";

// get user by id
export async function GET(request: Request){
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query("SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL", [id]);
    const user = result.rows[0];

    if (!user) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}

// update user
export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const body = await request.json();

  // Validate request body
  const validation = userUpdateSchema.safeParse(body);
  if (!validation.success) {
    return valErrorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, validation.error);
  }

  const { name, email, password } = validation.data;

  const updates = [];
  const values: any[] = [];
  let i = 1;

  if (name) {
    updates.push(`name = $${i++}`);
    values.push(name);
  }

  if (email) {
    updates.push(`email = $${i++}`);
    values.push(email);
  }

  if (password) {
    const hashedPassword = await hash(password, process.env.HASH_SALT ? parseInt(process.env.HASH_SALT) : 12);
    updates.push(`password = $${i++}`);
    values.push(hashedPassword);
  }

  if (updates.length === 0) {
    return errorRes(HTTP_STATUS.BAD_REQUEST, "No fields to update", null);
  }

  updates.push(`updated_at = NOW()`);
  const idParamIndex = values.length + 1;
  values.push(id);

  const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${idParamIndex} RETURNING id, name, email, created_at, updated_at`;
  
  try {
    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}

// soft delete user
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query(
      "UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING id, name, email, deleted_at",
      [id]
    );

    const deletedUser = result.rows[0];

    if (!deletedUser) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}

// restore user
export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query(
      "UPDATE users SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, deleted_at",
      [id]
    );

    const restoredUser = result.rows[0];

    if (!restoredUser) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, restoredUser);
  } catch (error) {
    console.error("Error restoring user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}
