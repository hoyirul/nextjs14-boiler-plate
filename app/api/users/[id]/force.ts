/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/[id]/force.ts
*/

import { successRes, errorRes } from "@/utils/response";
import pool from "@/lib/db";

// force delete user
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    const deletedUser = result.rows[0];
    return successRes(200, "User deleted successfully", deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorRes(500, "Failed to delete user");
  }
}