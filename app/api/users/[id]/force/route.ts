/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/[id]/force/route.ts
*/

import { successRes, errorRes } from "@/utils/response";
import { HTTP_STATUS, HTTP_MESSAGES } from "@/app/constants/http-status";
import pool from "@/lib/db";

// force delete user
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/")[3]; // /api/users/1/force → "1"

    // Validasi ID (basic check)
    if (!id || isNaN(Number(id))) {
      return errorRes(HTTP_STATUS.BAD_REQUEST, "Invalid user ID", null);
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (userExists.rowCount === 0) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    const deletedUser = result.rows[0];

    if (!deletedUser) {
      return errorRes(HTTP_STATUS.NOT_FOUND, "User not found", null);
    }

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, deletedUser);
  } catch (error) {
    console.error("Error force-deleting user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}
