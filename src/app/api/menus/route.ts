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

// GET: 전체 메뉴 목록
export async function GET() {
  try {
    await requireAuth();

    const rows = await query<MenuRow>(
      `SELECT ID, NAME, DESCRIPTION, ORDER_NUM, MENU_TYPE, PARENT_ID, IS_RELEASED,
              LAYOUT_JSON, CREATED_AT, UPDATED_AT
       FROM MENUS ORDER BY ORDER_NUM, ID`,
    );

    const menus = rows.map((row) => ({
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
    }));

    return NextResponse.json(menus);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Menus GET error:", error);
    return NextResponse.json({ error: "메뉴 목록 조회 실패" }, { status: 500 });
  }
}

// POST: 메뉴 생성
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { name, description, menuType, parentId } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "메뉴명을 입력해주세요." }, { status: 400 });
    }

    const countResult = await query<{ CNT: number }>("SELECT COUNT(*) AS CNT FROM MENUS");
    const order = countResult[0]?.CNT || 0;

    await execute(
      `INSERT INTO MENUS (NAME, DESCRIPTION, ORDER_NUM, MENU_TYPE, PARENT_ID)
       VALUES (:name, :description, :orderNum, :menuType, :parentId)`,
      {
        name,
        description: description || "",
        orderNum: order,
        menuType: menuType || "menu",
        parentId: parentId ? Number(parentId) : null,
      },
    );

    return NextResponse.json({ message: "메뉴가 생성되었습니다." }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Menus POST error:", error);
    return NextResponse.json({ error: "메뉴 생성 실패" }, { status: 500 });
  }
}
