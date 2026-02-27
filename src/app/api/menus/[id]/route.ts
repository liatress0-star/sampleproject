import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

interface MenuRow {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  ORDER_NUM: number;
  MENU_TYPE: string;
  PARENT_ID: number | null;
  IS_RELEASED: number;
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
      `SELECT ID, NAME, DESCRIPTION, ORDER_NUM, MENU_TYPE, PARENT_ID, IS_RELEASED,
              LAYOUT_JSON, CREATED_AT, UPDATED_AT
       FROM MENUS WHERE ID = :id`,
      { id: Number(id) },
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "메뉴를 찾을 수 없습니다." }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      id: String(row.ID),
      name: row.NAME,
      description: row.DESCRIPTION || "",
      order: row.ORDER_NUM,
      menuType: row.MENU_TYPE || "menu",
      parentId: row.PARENT_ID ? String(row.PARENT_ID) : null,
      released: row.IS_RELEASED === 1,
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
    const body = await request.json();

    // released 토글 전용
    if (body.released !== undefined && Object.keys(body).length === 1) {
      await execute(
        `UPDATE MENUS SET IS_RELEASED = :released, UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`,
        { released: body.released ? 1 : 0, id: Number(id) },
      );
      return NextResponse.json({ message: "릴리즈 상태가 변경되었습니다." });
    }

    const { name, description, order, menuType, parentId } = body;

    await execute(
      `UPDATE MENUS
       SET NAME = :name, DESCRIPTION = :description, ORDER_NUM = :orderNum,
           MENU_TYPE = :menuType, PARENT_ID = :parentId,
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id`,
      {
        name,
        description: description || "",
        orderNum: order ?? 0,
        menuType: menuType || "menu",
        parentId: parentId ? Number(parentId) : null,
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
