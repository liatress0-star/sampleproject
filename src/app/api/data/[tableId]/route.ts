import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

interface DataSourceRow {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  QUERY_TEXT: string;
}

// GET: 데이터 소스의 쿼리를 실행하여 결과 반환
// 사용법: /api/data/1 → DATA_SOURCES.ID=1의 쿼리 실행
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
) {
  try {
    await requireAuth();
    const { tableId } = await params;

    // 데이터 소스 조회
    const sources = await query<DataSourceRow>(
      "SELECT ID, NAME, DESCRIPTION, QUERY_TEXT FROM DATA_SOURCES WHERE ID = :id",
      { id: Number(tableId) },
    );

    if (sources.length === 0) {
      return NextResponse.json(
        { error: "데이터 소스를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const source = sources[0];

    // 등록된 쿼리 실행 (읽기 전용)
    const queryText = source.QUERY_TEXT;

    // 보안: SELECT만 허용
    const trimmed = queryText.trim().toUpperCase();
    if (!trimmed.startsWith("SELECT")) {
      return NextResponse.json(
        { error: "SELECT 쿼리만 실행할 수 있습니다." },
        { status: 400 },
      );
    }

    const data = await query(queryText);

    return NextResponse.json({
      source: {
        id: source.ID,
        name: source.NAME,
        description: source.DESCRIPTION,
      },
      data,
      totalCount: data.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Data GET error:", error);
    return NextResponse.json(
      { error: "데이터 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
