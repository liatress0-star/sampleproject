"use client";

import { BarChart, LineChart, PieChart } from "@/components/charts";
import { DataGrid } from "@/components/grid";
import {
  monthlySalesData,
  categoryData,
  weeklyVisitorData,
  productData,
  type Product,
} from "@/lib/sample-data";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Product>();

const productColumns = [
  columnHelper.accessor("name", { header: "상품명" }),
  columnHelper.accessor("category", { header: "카테고리" }),
  columnHelper.accessor("price", {
    header: "가격",
    cell: (info) => `${info.getValue().toLocaleString()}원`,
  }),
  columnHelper.accessor("stock", { header: "재고" }),
  columnHelper.accessor("status", {
    header: "상태",
    cell: (info) => {
      const status = info.getValue();
      const colors = {
        "판매중": "bg-green-100 text-green-700",
        "품절": "bg-red-100 text-red-700",
        "단종": "bg-gray-100 text-gray-700",
      };
      return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}>
          {status}
        </span>
      );
    },
  }),
];

const summaryCards = [
  { label: "총 매출", value: "7,800만원", change: "+8.3%", positive: true },
  { label: "신규 방문자", value: "1,600명", change: "+12.5%", positive: true },
  { label: "전환율", value: "3.2%", change: "-0.5%", positive: false },
  { label: "평균 주문액", value: "52,000원", change: "+2.1%", positive: true },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="mt-1 text-sm text-gray-500">주요 지표를 한눈에 확인하세요.</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
            <p
              className={`mt-1 text-sm font-medium ${
                card.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {card.change} 전월 대비
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineChart
          title="월별 매출 추이"
          data={monthlySalesData}
          xAxisKey="month"
          series={[
            { dataKey: "sales", name: "매출", color: "#3b82f6" },
            { dataKey: "target", name: "목표", color: "#9ca3af", strokeDasharray: "5 5" },
          ]}
          height={300}
        />
        <PieChart
          title="카테고리별 매출 비중"
          data={categoryData}
          height={300}
          outerRadius={100}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart
          title="주간 방문자 현황"
          data={weeklyVisitorData}
          xAxisKey="day"
          series={[
            { dataKey: "visitors", name: "방문자", color: "#3b82f6" },
            { dataKey: "pageViews", name: "페이지뷰", color: "#10b981" },
          ]}
          height={300}
        />
        <div>
          <DataGrid<Product>
            title="상품 현황 (Top 5)"
            data={productData.slice(0, 5)}
            columns={productColumns}
            pageSize={5}
            enableSearch={false}
          />
        </div>
      </div>
    </div>
  );
}
