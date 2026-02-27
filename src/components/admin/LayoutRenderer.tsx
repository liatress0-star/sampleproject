"use client";

import type { LayoutItem } from "@/lib/types";
import { BarChart, LineChart, PieChart, AreaChart } from "@/components/charts";
import { DataGrid, ExcelGrid, type ExcelColumn } from "@/components/grid";
import {
  monthlySalesData,
  categoryData,
  weeklyVisitorData,
  employeeData,
  salesData,
  type Employee,
} from "@/lib/sample-data";
import { createColumnHelper } from "@tanstack/react-table";

const CELL_HEIGHT = 80;

// Sample column definitions for DataGrid
const empHelper = createColumnHelper<Employee>();
const employeeColumns = [
  empHelper.accessor("id", { header: "ID" }),
  empHelper.accessor("name", { header: "이름" }),
  empHelper.accessor("department", { header: "부서" }),
  empHelper.accessor("position", { header: "직책" }),
  empHelper.accessor("salary", {
    header: "연봉(만원)",
    cell: (info) => info.getValue().toLocaleString(),
  }),
  empHelper.accessor("status", {
    header: "상태",
    cell: (info) => {
      const status = info.getValue();
      const colors: Record<string, string> = {
        "재직": "bg-green-100 text-green-700",
        "휴직": "bg-yellow-100 text-yellow-700",
        "퇴직": "bg-gray-100 text-gray-600",
      };
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}>
          {status}
        </span>
      );
    },
  }),
];

// Sample columns for ExcelGrid
const excelColumns: ExcelColumn[] = [
  { key: "region", header: "지역", width: 100, type: "text" },
  { key: "product", header: "제품", width: 120, type: "text" },
  { key: "q1", header: "1분기", width: 100, type: "number" },
  { key: "q2", header: "2분기", width: 100, type: "number" },
  { key: "q3", header: "3분기", width: 100, type: "number" },
  { key: "q4", header: "4분기", width: 100, type: "number" },
  { key: "total", header: "합계", width: 110, type: "number", editable: false },
];

function FilterPanel({ title }: { title: string }) {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">기간</label>
          <select className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm">
            <option>전체</option>
            <option>최근 1개월</option>
            <option>최근 3개월</option>
            <option>최근 6개월</option>
            <option>최근 1년</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
          <select className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm">
            <option>전체</option>
            <option>전자제품</option>
            <option>의류</option>
            <option>식품</option>
            <option>가구</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">지역</label>
          <select className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm">
            <option>전체</option>
            <option>서울</option>
            <option>부산</option>
            <option>대구</option>
            <option>인천</option>
            <option>광주</option>
          </select>
        </div>
        <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
          조회
        </button>
      </div>
    </div>
  );
}

function renderComponent(item: LayoutItem, height: number) {
  const chartHeight = Math.max(height - 60, 150);

  switch (item.componentType) {
    case "filter-panel":
      return <FilterPanel title={item.title} />;

    case "bar-chart":
      return (
        <BarChart
          title={item.title}
          data={monthlySalesData}
          xAxisKey="month"
          series={[
            { dataKey: "sales", name: "매출", color: "#3b82f6" },
            { dataKey: "target", name: "목표", color: "#94a3b8" },
          ]}
          height={chartHeight}
        />
      );

    case "line-chart":
      return (
        <LineChart
          title={item.title}
          data={monthlySalesData}
          xAxisKey="month"
          series={[
            { dataKey: "sales", name: "매출", color: "#3b82f6" },
            { dataKey: "profit", name: "이익", color: "#10b981" },
          ]}
          height={chartHeight}
        />
      );

    case "pie-chart":
      return (
        <PieChart
          title={item.title}
          data={categoryData}
          height={chartHeight}
        />
      );

    case "area-chart":
      return (
        <AreaChart
          title={item.title}
          data={weeklyVisitorData}
          xAxisKey="day"
          series={[
            { dataKey: "visitors", name: "방문자", color: "#3b82f6" },
            { dataKey: "pageViews", name: "페이지뷰", color: "#10b981" },
          ]}
          height={chartHeight}
        />
      );

    case "data-grid":
      return (
        <DataGrid<Employee>
          title={item.title}
          data={employeeData}
          columns={employeeColumns}
          pageSize={5}
        />
      );

    case "excel-grid":
      return (
        <ExcelGrid
          title={item.title}
          data={salesData as unknown as Record<string, string | number>[]}
          columns={excelColumns}
        />
      );

    default:
      return (
        <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
          알 수 없는 컴포넌트: {item.componentType}
        </div>
      );
  }
}

interface LayoutRendererProps {
  items: LayoutItem[];
}

export default function LayoutRenderer({ items }: LayoutRendererProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-400">레이아웃이 설정되지 않았습니다.</p>
      </div>
    );
  }

  // Calculate total grid rows needed
  const maxRow = Math.max(...items.map((i) => i.y + i.height));

  return (
    <div
      className="relative"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gridTemplateRows: `repeat(${maxRow}, ${CELL_HEIGHT}px)`,
        gap: "12px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            gridColumn: `${item.x + 1} / ${item.x + item.width + 1}`,
            gridRow: `${item.y + 1} / ${item.y + item.height + 1}`,
          }}
        >
          {renderComponent(item, item.height * CELL_HEIGHT)}
        </div>
      ))}
    </div>
  );
}
