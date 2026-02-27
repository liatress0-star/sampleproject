import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

// PUT: 레이아웃 저장
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { layout } = await request.json();

    await execute(
      `UPDATE MENUS
       SET LAYOUT_JSON = :layoutJson, UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id`,
      {
        layoutJson: JSON.stringify(layout),
        id: Number(id),
      },
    );

    return NextResponse.json({ message: "레이아웃이 저장되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Layout PUT error:", error);
    return NextResponse.json({ error: "레이아웃 저장 실패" }, { status: 500 });
  }
}
