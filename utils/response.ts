import { NextResponse } from "next/server";
// make response with code, message, and data
export function successRes(code: number, message: string, data?: any) {
  return NextResponse.json({
    status: code,
    success: true,
    message,
    data,
  });
}

export function errorRes(code: number, message: string) {
  return NextResponse.json({
    status: code,
    success: false,
    message,
  });
}
