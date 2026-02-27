import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

interface PermissionRow {
  ID: number;
  MENU_ID: number;
  MENU_NAME: string;
  CAN_READ: number;
  CAN_WRITE: number;
  CAN_DELETE: number;
}

// GET: 권한 그룹 상세 + 메뉴별 권한
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const permissions = await query<PermissionRow>(
      `SELECT RP.ID, RP.MENU_ID, M.NAME AS MENU_NAME,
              RP.CAN_READ, RP.CAN_WRITE, RP.CAN_DELETE
       FROM ROLE_PERMISSIONS RP
       JOIN MENUS M ON RP.MENU_ID = M.ID
       WHERE RP.ROLE_GROUP_ID = :roleGroupId
       ORDER BY M.ORDER_NUM`,
      { roleGroupId: Number(id) },
    );

    return NextResponse.json(
      permissions.map((p) => ({
        id: p.ID,
        menuId: p.MENU_ID,
        menuName: p.MENU_NAME,
        canRead: p.CAN_READ === 1,
        canWrite: p.CAN_WRITE === 1,
        canDelete: p.CAN_DELETE === 1,
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("RoleGroup GET error:", error);
    return NextResponse.json({ error: "권한 조회 실패" }, { status: 500 });
  }
}

// PUT: 권한 그룹 수정 (이름 + 메뉴별 권한 일괄 저장)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { name, description, permissions } = await request.json();

    const roleGroupId = Number(id);

    if (name) {
      await execute(
        "UPDATE ROLE_GROUPS SET NAME = :name, DESCRIPTION = :description, UPDATED_AT = SYSTIMESTAMP WHERE ID = :id",
        { name, description: description || "", id: roleGroupId },
      );
    }

    if (permissions && Array.isArray(permissions)) {
      // 기존 권한 삭제 후 재등록
      await execute(
        "DELETE FROM ROLE_PERMISSIONS WHERE ROLE_GROUP_ID = :roleGroupId",
        { roleGroupId },
      );

      for (const perm of permissions) {
        await execute(
          `INSERT INTO ROLE_PERMISSIONS (ROLE_GROUP_ID, MENU_ID, CAN_READ, CAN_WRITE, CAN_DELETE)
           VALUES (:roleGroupId, :menuId, :canRead, :canWrite, :canDelete)`,
          {
            roleGroupId,
            menuId: perm.menuId,
            canRead: perm.canRead ? 1 : 0,
            canWrite: perm.canWrite ? 1 : 0,
            canDelete: perm.canDelete ? 1 : 0,
          },
        );
      }
    }

    return NextResponse.json({ message: "권한 그룹이 수정되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("RoleGroup PUT error:", error);
    return NextResponse.json({ error: "권한 수정 실패" }, { status: 500 });
  }
}

// DELETE: 권한 그룹 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    await execute("DELETE FROM ROLE_GROUPS WHERE ID = :id", { id: Number(id) });

    return NextResponse.json({ message: "권한 그룹이 삭제되었습니다." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("RoleGroup DELETE error:", error);
    return NextResponse.json({ error: "권한 삭제 실패" }, { status: 500 });
  }
}
