import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

interface MenuRow {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  ORDER_NUM: number;
  LAYOUT_JSON: string | null;
  CREATED_AT: string;
  UPDATED_AT: string;
}

// GET: 단일 메뉴 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const rows = await query<MenuRow>(
      "SELECT ID, NAME, DESCRIPTION, ORDER_NUM, LAYOUT_JSON, CREATED_AT, UPDATED_AT FROM MENUS WHERE ID = :id",
      { id: Number(id) },
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "메뉴를 찾을 수 없습니다." }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION || "",
      order: row.ORDER_NUM,
      layout: row.LAYOUT_JSON ? JSON.parse(row.LAYOUT_JSON) : [],
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Menu GET error:", error);
    return NextResponse.json({ error: "메뉴 조회 실패" }, { status: 500 });
  }
}

// PUT: 메뉴 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { name, description, order } = await request.json();

    await execute(
      `UPDATE MENUS
       SET NAME = :name, DESCRIPTION = :description, ORDER_NUM = :orderNum, UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id`,
      {
        name,
        description: description || "",
        orderNum: order ?? 0,
        id: Number(id),
      },
    );

    return NextResponse.json({ message: "메뉴가 수정되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Menu PUT error:", error);
    return NextResponse.json({ error: "메뉴 수정 실패" }, { status: 500 });
  }
}

// DELETE: 메뉴 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    await execute("DELETE FROM MENUS WHERE ID = :id", { id: Number(id) });

    return NextResponse.json({ message: "메뉴가 삭제되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Menu DELETE error:", error);
    return NextResponse.json({ error: "메뉴 삭제 실패" }, { status: 500 });
  }
}
