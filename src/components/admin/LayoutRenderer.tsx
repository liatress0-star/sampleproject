"use client";

import { useState } from "react";
import type { LayoutItem, FilterItemConfig } from "@/lib/types";
import { loadDataSources } from "@/lib/datasource-store";
import type { DataSourceConfig } from "@/lib/types";
import { BarChart, LineChart, PieChart, AreaChart } from "@/components/charts";
import { DataGrid, ExcelGrid, type ExcelColumn } from "@/components/grid";
import {
  monthlySalesData,
  categoryData,
  weeklyVisitorData,
  employeeData,
  productData,
  salesData,
  type Employee,
  type Product,
} from "@/lib/sample-data";
import { createColumnHelper } from "@tanstack/react-table";

const CELL_HEIGHT = 80;

// ── 데이터소스 → 실제 데이터 매핑 ──

function getChartData(dataSourceId?: string): Record<string, unknown>[] {
  switch (dataSourceId) {
    case "monthly-sales":
      return monthlySalesData;
    case "weekly-visitors":
      return weeklyVisitorData;
    default:
      return monthlySalesData;
  }
}

function getPieData(
  dataSourceId?: string
): { name: string; value: number; color: string }[] {
  switch (dataSourceId) {
    case "category":
      return categoryData;
    default:
      return categoryData;
  }
}

// ── 그리드 컬럼 정의 ──

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
        재직: "bg-green-100 text-green-700",
        휴직: "bg-yellow-100 text-yellow-700",
        퇴직: "bg-gray-100 text-gray-600",
      };
      return (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}
        >
          {status}
        </span>
      );
    },
  }),
];

const prodHelper = createColumnHelper<Product>();
const productColumns = [
  prodHelper.accessor("id", { header: "ID" }),
  prodHelper.accessor("name", { header: "제품명" }),
  prodHelper.accessor("category", { header: "카테고리" }),
  prodHelper.accessor("price", {
    header: "가격",
    cell: (info) => `${info.getValue().toLocaleString()}원`,
  }),
  prodHelper.accessor("stock", { header: "재고" }),
  prodHelper.accessor("rating", {
    header: "평점",
    cell: (info) => `${info.getValue().toFixed(1)}`,
  }),
  prodHelper.accessor("status", {
    header: "상태",
    cell: (info) => {
      const status = info.getValue();
      const colors: Record<string, string> = {
        판매중: "bg-green-100 text-green-700",
        품절: "bg-red-100 text-red-700",
        단종: "bg-gray-100 text-gray-600",
      };
      return (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}
        >
          {status}
        </span>
      );
    },
  }),
];

// ExcelGrid 컬럼
const excelColumns: ExcelColumn[] = [
  { key: "region", header: "지역", width: 100, type: "text" },
  { key: "product", header: "제품", width: 120, type: "text" },
  { key: "q1", header: "1분기", width: 100, type: "number" },
  { key: "q2", header: "2분기", width: 100, type: "number" },
  { key: "q3", header: "3분기", width: 100, type: "number" },
  { key: "q4", header: "4분기", width: 100, type: "number" },
  { key: "total", header: "합계", width: 110, type: "number", editable: false },
];

// ── 필터 패널 렌더러 ──

function FilterPanel({
  title,
  items,
}: {
  title: string;
  items?: FilterItemConfig[];
}) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // 설정된 아이템이 없으면 기본 필터 표시
  const filterItems: FilterItemConfig[] =
    items && items.length > 0
      ? items
      : [
          {
            id: "default-period",
            type: "select",
            label: "기간",
            options: ["전체", "최근 1개월", "최근 3개월", "최근 6개월", "최근 1년"],
          },
          {
            id: "default-category",
            type: "select",
            label: "카테고리",
            options: ["전체", "전자제품", "의류", "식품", "가구"],
          },
          {
            id: "default-region",
            type: "select",
            label: "지역",
            options: ["전체", "서울", "부산", "대구", "인천", "광주"],
          },
        ];

  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="space-y-3">
        {filterItems.map((fi) => (
          <div key={fi.id}>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {fi.label}
            </label>

            {/* 드롭다운 */}
            {fi.type === "select" && (
              <select className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm">
                {(fi.options || []).map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* 라디오 버튼 */}
            {fi.type === "radio" && (
              <div className="flex flex-wrap gap-2">
                {(fi.options || []).map((opt, idx) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`radio-${fi.id}`}
                      defaultChecked={idx === 0}
                      className="h-3 w-3 text-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* 텍스트 입력 */}
            {fi.type === "text" && (
              <input
                type="text"
                placeholder={fi.placeholder || "입력하세요"}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}

            {/* 날짜 기간 선택 */}
            {fi.type === "date-range" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}
        <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
          조회
        </button>
      </div>
    </div>
  );
}

// ── 컴포넌트 렌더러 ──

function renderComponent(item: LayoutItem, height: number) {
  const chartHeight = Math.max(height - 60, 150);
  const p = (item.props || {}) as Record<string, unknown>;

  const showLegend = (p.showLegend as boolean) ?? true;
  const showGrid = (p.showGrid as boolean) ?? true;

  switch (item.componentType) {
    case "filter-panel":
      return (
        <FilterPanel
          title={item.title}
          items={p.items as FilterItemConfig[] | undefined}
        />
      );

    case "bar-chart": {
      const data = getChartData(p.dataSource as string | undefined);
      const ds = loadDataSources().find((d: DataSourceConfig) => d.id === p.dataSource);
      const series = (p.series as { dataKey: string; name: string; color: string }[]) ||
        (ds
          ? ds.valueKeys.slice(0, 2).map((vk, i) => ({
              dataKey: vk,
              name: ds.fields.find((f) => f.key === vk)?.label || vk,
              color: ["#3b82f6", "#94a3b8", "#10b981"][i] || "#3b82f6",
            }))
          : [
              { dataKey: "sales", name: "매출", color: "#3b82f6" },
              { dataKey: "target", name: "목표", color: "#94a3b8" },
            ]);
      const xAxisKey =
        (p.xAxisKey as string) || ds?.xAxisKeys[0] || "month";

      return (
        <BarChart
          title={item.title}
          data={data}
          xAxisKey={xAxisKey}
          series={series}
          height={chartHeight}
          showLegend={showLegend}
          showGrid={showGrid}
        />
      );
    }

    case "line-chart": {
      const data = getChartData(p.dataSource as string | undefined);
      const ds = loadDataSources().find((d: DataSourceConfig) => d.id === p.dataSource);
      const series = (p.series as { dataKey: string; name: string; color: string }[]) ||
        (ds
          ? ds.valueKeys.slice(0, 2).map((vk, i) => ({
              dataKey: vk,
              name: ds.fields.find((f) => f.key === vk)?.label || vk,
              color: ["#3b82f6", "#10b981", "#f59e0b"][i] || "#3b82f6",
            }))
          : [
              { dataKey: "sales", name: "매출", color: "#3b82f6" },
              { dataKey: "profit", name: "이익", color: "#10b981" },
            ]);
      const xAxisKey =
        (p.xAxisKey as string) || ds?.xAxisKeys[0] || "month";

      return (
        <LineChart
          title={item.title}
          data={data}
          xAxisKey={xAxisKey}
          series={series}
          height={chartHeight}
          showLegend={showLegend}
          showGrid={showGrid}
        />
      );
    }

    case "pie-chart": {
      const pieData = getPieData(p.dataSource as string | undefined);
      const colors = p.colors as string[] | undefined;
      const coloredData = colors
        ? pieData.map((d, i) => ({
            ...d,
            color: colors[i % colors.length] || d.color,
          }))
        : pieData;

      return (
        <PieChart
          title={item.title}
          data={coloredData}
          height={chartHeight}
          innerRadius={(p.innerRadius as number) ?? 0}
          showLegend={showLegend}
        />
      );
    }

    case "area-chart": {
      const data = getChartData(p.dataSource as string | undefined);
      const ds = loadDataSources().find((d: DataSourceConfig) => d.id === p.dataSource);
      const series = (p.series as { dataKey: string; name: string; color: string }[]) ||
        (ds
          ? ds.valueKeys.slice(0, 2).map((vk, i) => ({
              dataKey: vk,
              name: ds.fields.find((f) => f.key === vk)?.label || vk,
              color: ["#3b82f6", "#10b981"][i] || "#3b82f6",
            }))
          : [
              { dataKey: "visitors", name: "방문자", color: "#3b82f6" },
              { dataKey: "pageViews", name: "페이지뷰", color: "#10b981" },
            ]);
      const xAxisKey =
        (p.xAxisKey as string) || ds?.xAxisKeys[0] || "day";

      // area-chart 기본 데이터소스가 없으면 주간 방문자 데이터
      const finalData = p.dataSource ? data : weeklyVisitorData;

      return (
        <AreaChart
          title={item.title}
          data={finalData}
          xAxisKey={xAxisKey}
          series={series}
          height={chartHeight}
          showLegend={showLegend}
          showGrid={showGrid}
        />
      );
    }

    case "data-grid": {
      const dsId = p.dataSource as string | undefined;
      const pageSize = (p.pageSize as number) ?? 5;
      const enableSearch = (p.enableSearch as boolean) ?? true;

      if (dsId === "product") {
        return (
          <DataGrid<Product>
            title={item.title}
            data={productData}
            columns={productColumns}
            pageSize={pageSize}
            enableSearch={enableSearch}
          />
        );
      }
      return (
        <DataGrid<Employee>
          title={item.title}
          data={employeeData}
          columns={employeeColumns}
          pageSize={pageSize}
          enableSearch={enableSearch}
        />
      );
    }

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
