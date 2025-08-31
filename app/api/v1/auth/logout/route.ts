/* 
  Author  : Mochammad Hairullah
  Path    : /app/api/auth/logout/route.ts
*/

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { successRes } from "@/utils/response";
import { HTTP_STATUS, HTTP_MESSAGES } from "@/app/constants/http-status";

export async function POST() {
  try {
    cookies().delete("token");

    return successRes(HTTP_STATUS.OK, "Logged out successfully", {});
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    );
  }
}
