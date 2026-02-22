"use client";

import { useState } from "react";
import { ExcelGrid, type ExcelColumn } from "@/components/grid";
import { salesData, type SalesRecord } from "@/lib/sample-data";

// 매출 데이터 컬럼 정의
const salesColumns: ExcelColumn[] = [
  { key: "region", header: "지역", width: 100, type: "text" },
  { key: "product", header: "제품", width: 120, type: "text" },
  { key: "q1", header: "1분기", width: 110, type: "number" },
  { key: "q2", header: "2분기", width: 110, type: "number" },
  { key: "q3", header: "3분기", width: 110, type: "number" },
  { key: "q4", header: "4분기", width: 110, type: "number" },
  { key: "total", header: "합계", width: 120, type: "number", editable: false },
];

// 빈 그리드용 컬럼 정의
const emptyColumns: ExcelColumn[] = [
  { key: "col1", header: "항목 A", width: 140, type: "text" },
  { key: "col2", header: "항목 B", width: 140, type: "text" },
  { key: "col3", header: "값 1", width: 120, type: "number" },
  { key: "col4", header: "값 2", width: 120, type: "number" },
  { key: "col5", header: "값 3", width: 120, type: "number" },
  { key: "col6", header: "비고", width: 180, type: "text" },
];

function createEmptyRows(count: number): Record<string, string | number>[] {
  return Array.from({ length: count }, () => ({
    col1: "",
    col2: "",
    col3: 0,
    col4: 0,
    col5: 0,
    col6: "",
  }));
}

export default function ExcelGridPage() {
  const [data, setData] = useState<Record<string, string | number>[]>(
    salesData as unknown as Record<string, string | number>[]
  );
  const [emptyData, setEmptyData] = useState(createEmptyRows(10));
  const [changeLog, setChangeLog] = useState<string[]>([]);

  const handleSalesChange = (newData: Record<string, string | number>[]) => {
    // Auto-calculate total
    const calculated = newData.map((row) => ({
      ...row,
      total:
        Number(row.q1 || 0) +
        Number(row.q2 || 0) +
        Number(row.q3 || 0) +
        Number(row.q4 || 0),
    }));
    setData(calculated);

    setChangeLog((prev) => {
      const msg = `[${new Date().toLocaleTimeString("ko-KR")}] 매출 데이터 수정됨`;
      return [msg, ...prev].slice(0, 10);
    });
  };

  const handleEmptyChange = (newData: Record<string, string | number>[]) => {
    setEmptyData(newData);
    setChangeLog((prev) => {
      const msg = `[${new Date().toLocaleTimeString("ko-KR")}] 빈 그리드 데이터 변경됨`;
      return [msg, ...prev].slice(0, 10);
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">엑셀 연동 그리드</h2>
        <p className="mt-1 text-sm text-gray-500">
          드래그로 셀을 선택하고 엑셀과 데이터를 주고받을 수 있습니다.
        </p>
      </div>

      {/* 사용법 안내 */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="mb-3 text-sm font-semibold text-blue-800">사용 방법</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium">그리드 → 엑셀</p>
            <ol className="mt-1 list-inside list-decimal space-y-1 text-xs">
              <li>마우스로 드래그하여 셀 범위를 선택합니다</li>
              <li><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Ctrl+C</kbd>로 복사합니다</li>
              <li>엑셀을 열고 <kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Ctrl+V</kbd>로 붙여넣습니다</li>
            </ol>
          </div>
          <div>
            <p className="font-medium">엑셀 → 그리드</p>
            <ol className="mt-1 list-inside list-decimal space-y-1 text-xs">
              <li>엑셀에서 원하는 셀 범위를 선택하고 <kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Ctrl+C</kbd>로 복사합니다</li>
              <li>그리드에서 붙여넣을 시작 셀을 클릭합니다</li>
              <li><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Ctrl+V</kbd>로 붙여넣습니다</li>
            </ol>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-blue-600">
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Shift+클릭</kbd> 범위 확장</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Ctrl+A</kbd> 전체 선택</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Enter / F2</kbd> 셀 편집</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Tab</kbd> 다음 셀 이동</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">Delete</kbd> 선택 셀 삭제</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">방향키</kbd> 셀 이동</span>
          <span><kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono">더블클릭</kbd> 셀 편집</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* 매출 데이터 그리드 */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            지역별 매출 현황
            <span className="ml-2 text-xs font-normal text-gray-400">
              합계 열은 자동 계산됩니다
            </span>
          </h3>
          <ExcelGrid
            title="매출 데이터"
            data={data}
            columns={salesColumns}
            onChange={handleSalesChange}
          />
        </section>

        {/* 빈 그리드 (엑셀에서 붙여넣기용) */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            빈 그리드
            <span className="ml-2 text-xs font-normal text-gray-400">
              엑셀에서 복사한 데이터를 여기에 붙여넣어 보세요
            </span>
          </h3>
          <ExcelGrid
            title="데이터 입력"
            data={emptyData}
            columns={emptyColumns}
            onChange={handleEmptyChange}
          />
        </section>

        {/* 변경 로그 */}
        {changeLog.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-600">변경 이력</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              {changeLog.map((log, i) => (
                <p key={i} className="text-xs text-gray-500">{log}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
