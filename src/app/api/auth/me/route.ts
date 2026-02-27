import { NextResponse } from "next/server";
import { getAuthFromCookie, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  const user = await getAuthFromCookie();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ message: "로그아웃 되었습니다." });
}
