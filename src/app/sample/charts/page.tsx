"use client";

import { BarChart, LineChart, PieChart, AreaChart } from "@/components/charts";
import {
  monthlySalesData,
  categoryData,
  weeklyVisitorData,
} from "@/lib/sample-data";

export default function ChartSamplePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">차트 샘플</h2>
        <p className="mt-1 text-sm text-gray-500">
          다양한 차트 컴포넌트를 확인할 수 있습니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* Bar Chart */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Bar Chart</h3>
          <BarChart
            title="월별 매출 실적 vs 목표"
            data={monthlySalesData}
            xAxisKey="month"
            series={[
              { dataKey: "sales", name: "실적", color: "#3b82f6" },
              { dataKey: "target", name: "목표", color: "#d1d5db" },
            ]}
          />
        </section>

        {/* Line Chart */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Line Chart</h3>
          <LineChart
            title="월별 매출 및 수익 추이"
            data={monthlySalesData}
            xAxisKey="month"
            series={[
              { dataKey: "sales", name: "매출", color: "#3b82f6" },
              { dataKey: "profit", name: "수익", color: "#10b981" },
              { dataKey: "target", name: "목표", color: "#9ca3af", strokeDasharray: "5 5" },
            ]}
          />
        </section>

        {/* Pie & Donut Charts */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Pie & Donut Chart</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PieChart
              title="카테고리별 매출 (Pie)"
              data={categoryData}
            />
            <PieChart
              title="카테고리별 매출 (Donut)"
              data={categoryData}
              innerRadius={80}
            />
          </div>
        </section>

        {/* Area Chart */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Area Chart</h3>
          <AreaChart
            title="주간 방문자 및 페이지뷰"
            data={weeklyVisitorData}
            xAxisKey="day"
            series={[
              { dataKey: "pageViews", name: "페이지뷰", color: "#8b5cf6" },
              { dataKey: "visitors", name: "방문자", color: "#3b82f6" },
            ]}
          />
        </section>

        {/* Multi-series Bar Chart */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Multi-series Bar Chart
          </h3>
          <BarChart
            title="월별 매출 / 수익 / 목표 비교"
            data={monthlySalesData}
            xAxisKey="month"
            series={[
              { dataKey: "sales", name: "매출", color: "#3b82f6" },
              { dataKey: "profit", name: "수익", color: "#10b981" },
              { dataKey: "target", name: "목표", color: "#f59e0b" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
