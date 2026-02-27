import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, AuthError, hashPassword } from "@/lib/auth";

interface UserRow {
  ID: number;
  USERNAME: string;
  NAME: string;
  EMAIL: string;
  ROLE_GROUP_ID: number | null;
  ROLE_GROUP_NAME: string | null;
  IS_ACTIVE: number;
  CREATED_AT: string;
}

// GET: 전체 사용자 목록
export async function GET() {
  try {
    await requireAuth();

    const rows = await query<UserRow>(
      `SELECT U.ID, U.USERNAME, U.NAME, U.EMAIL,
              U.ROLE_GROUP_ID, R.NAME AS ROLE_GROUP_NAME,
              U.IS_ACTIVE, U.CREATED_AT
       FROM USERS U
       LEFT JOIN ROLE_GROUPS R ON U.ROLE_GROUP_ID = R.ID
       ORDER BY U.ID`,
    );

    return NextResponse.json(
      rows.map((r) => ({
        id: r.ID,
        username: r.USERNAME,
        name: r.NAME,
        email: r.EMAIL,
        roleGroupId: r.ROLE_GROUP_ID,
        roleGroupName: r.ROLE_GROUP_NAME,
        isActive: r.IS_ACTIVE === 1,
        createdAt: r.CREATED_AT,
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "사용자 목록 조회 실패" }, { status: 500 });
  }
}

// PUT: 사용자 수정 (권한그룹 변경, 비밀번호 초기화 등)
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const { id, name, email, roleGroupId, isActive, newPassword } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다." }, { status: 400 });
    }

    let sql = `UPDATE USERS SET NAME = :name, EMAIL = :email,
               ROLE_GROUP_ID = :roleGroupId, IS_ACTIVE = :isActive,
               UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`;
    const binds: Record<string, string | number | null> = {
      name,
      email: email || null,
      roleGroupId: roleGroupId || null,
      isActive: isActive ? 1 : 0,
      id,
    };

    if (newPassword) {
      sql = `UPDATE USERS SET NAME = :name, EMAIL = :email,
             ROLE_GROUP_ID = :roleGroupId, IS_ACTIVE = :isActive,
             PASSWORD_HASH = :passwordHash,
             UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`;
      binds.passwordHash = await hashPassword(newPassword);
    }

    await execute(sql, binds);

    return NextResponse.json({ message: "사용자 정보가 수정되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "사용자 수정 실패" }, { status: 500 });
  }
}
