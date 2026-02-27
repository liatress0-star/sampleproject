import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

interface RoleGroupRow {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  CREATED_AT: string;
}

// GET: 전체 권한 그룹 목록
export async function GET() {
  try {
    await requireAuth();

    const rows = await query<RoleGroupRow>(
      "SELECT ID, NAME, DESCRIPTION, CREATED_AT FROM ROLE_GROUPS ORDER BY ID",
    );

    return NextResponse.json(
      rows.map((r) => ({
        id: r.ID,
        name: r.NAME,
        description: r.DESCRIPTION || "",
        createdAt: r.CREATED_AT,
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("RoleGroups GET error:", error);
    return NextResponse.json({ error: "권한 그룹 조회 실패" }, { status: 500 });
  }
}

// POST: 권한 그룹 생성
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "그룹명을 입력해주세요." }, { status: 400 });
    }

    await execute(
      "INSERT INTO ROLE_GROUPS (NAME, DESCRIPTION) VALUES (:name, :description)",
      { name, description: description || "" },
    );

    return NextResponse.json({ message: "권한 그룹이 생성되었습니다." }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("RoleGroups POST error:", error);
    return NextResponse.json({ error: "권한 그룹 생성 실패" }, { status: 500 });
  }
}
