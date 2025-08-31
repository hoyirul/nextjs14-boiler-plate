/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/[id]/route.ts
*/

import { successRes, errorRes } from "@/utils/response";
import pool from "@/lib/db";
import { hash } from "bcrypt";

// update user
export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const body = await request.json();
  const { name, email, password } = body;

  // Hash password
  const hashedPassword = await hash(password, 10);

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
      [name, email, hashedPassword, id]
    );
    const updatedUser = result.rows[0];
    return successRes(200, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorRes(500, "Failed to update user");
  }
}

// soft delete
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query(
      "UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    const deletedUser = result.rows[0];
    return successRes(200, "User deleted successfully", deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorRes(500, "Failed to delete user");
  }
}

// restore user
export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query(
      "UPDATE users SET deleted_at = NULL WHERE id = $1 RETURNING *",
      [id]
    );
    const restoredUser = result.rows[0];
    return successRes(200, "User restored successfully", restoredUser);
  } catch (error) {
    console.error("Error restoring user:", error);
    return errorRes(500, "Failed to restore user");
  }
}
