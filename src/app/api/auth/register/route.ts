import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, email, roleGroupId } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요. (아이디, 비밀번호, 이름)" },
        { status: 400 },
      );
    }

    // 중복 확인
    const existing = await query(
      "SELECT ID FROM USERS WHERE USERNAME = :username",
      { username },
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    await execute(
      `INSERT INTO USERS (USERNAME, PASSWORD_HASH, NAME, EMAIL, ROLE_GROUP_ID)
       VALUES (:username, :passwordHash, :name, :email, :roleGroupId)`,
      {
        username,
        passwordHash,
        name,
        email: email || null,
        roleGroupId: roleGroupId || null,
      },
    );

    return NextResponse.json({ message: "회원가입이 완료되었습니다." }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
