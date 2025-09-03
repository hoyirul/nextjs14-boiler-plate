/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/users/route.ts
*/

import pool from "@/lib/db";
import { successRes, errorRes, valErrorRes } from "@/utils/response";
import { userCreateSchema } from "@/app/schemas/users/schema";
import { HTTP_MESSAGES, HTTP_STATUS } from "@/app/constants/http-status";
import { hash } from "bcrypt";

// Create user
export async function POST(request: Request) {
  const body = await request.json();
  const validation = userCreateSchema.safeParse(body);
  if (!validation.success) {
    return valErrorRes(HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, validation.error);
  }

  const { name, email, password } = validation.data;
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
    return successRes(HTTP_STATUS.CREATED, HTTP_MESSAGES.CREATED, result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}

// Get users with pagination, search, sorting, filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const order = (searchParams.get("order") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

    const filterName = searchParams.get("name") || "";
    const filterEmail = searchParams.get("email") || "";

    // Build WHERE clauses dynamically
    const conditions: string[] = ["deleted_at IS NULL"];
    const values: any[] = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }

    if (filterName) {
      values.push(`%${filterName}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    if (filterEmail) {
      values.push(`%${filterEmail}%`);
      conditions.push(`email ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total count
    const totalResult = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, values);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Data with pagination
    const query = `
      SELECT id, name, email, created_at
      FROM users
      ${whereClause}
      ORDER BY ${sortBy} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const usersResult = await pool.query(query, values);

    return successRes(HTTP_STATUS.OK, HTTP_MESSAGES.OK, {
      data: usersResult.rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorRes(HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGES.INTERNAL_SERVER_ERROR, error);
  }
}
