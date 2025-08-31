/* 
  Author  : Mochammad Hairullah
  Path    : /app/utils/response.ts
*/

import { NextResponse } from "next/server";
import { ZodError } from "zod";
// make response with code, message, and data
export function successRes(code: number, message: string, data?: any) {
  return NextResponse.json({
    status: code,
    success: true,
    message,
    data,
  });
}

export function errorRes(code: number, message: string, error: unknown) {
  return NextResponse.json({
    status: code,
    success: false,
    message,
    error,
  }, { status: code });
}

export function valErrorRes(code: number, message: string, error: unknown) {
  let parsedError: string | { path: string; message: string }[] = "Unknown error";

  if (error instanceof ZodError) {
    parsedError = error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  } else if (error instanceof Error) {
    parsedError = error.message;
  } else if (typeof error === "string") {
    parsedError = error;
  }

  return NextResponse.json({
    status: code,
    success: false,
    message,
    error: parsedError,
  }, { status: code });
}
