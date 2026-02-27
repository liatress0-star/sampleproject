import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

interface UserRow {
  ID: number;
  USERNAME: string;
  PASSWORD_HASH: string;
  NAME: string;
  EMAIL: string;
  ROLE_GROUP_ID: number | null;
  ROLE_GROUP_NAME: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    const rows = await query<UserRow>(
      `SELECT U.ID, U.USERNAME, U.PASSWORD_HASH, U.NAME, U.EMAIL,
              U.ROLE_GROUP_ID, R.NAME AS ROLE_GROUP_NAME
       FROM USERS U
       LEFT JOIN ROLE_GROUPS R ON U.ROLE_GROUP_ID = R.ID
       WHERE U.USERNAME = :username AND U.IS_ACTIVE = 1`,
      { username },
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.PASSWORD_HASH);
    if (!valid) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    await setAuthCookie({
      userId: user.ID,
      username: user.USERNAME,
      name: user.NAME,
      roleGroupId: user.ROLE_GROUP_ID,
      roleGroupName: user.ROLE_GROUP_NAME,
    });

    return NextResponse.json({
      user: {
        id: user.ID,
        username: user.USERNAME,
        name: user.NAME,
        roleGroupId: user.ROLE_GROUP_ID,
        roleGroupName: user.ROLE_GROUP_NAME,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
