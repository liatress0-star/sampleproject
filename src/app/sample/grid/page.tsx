"use client";

import { DataGrid } from "@/components/grid";
import {
  employeeData,
  productData,
  type Employee,
  type Product,
} from "@/lib/sample-data";
import { createColumnHelper } from "@tanstack/react-table";

// 직원 그리드 컬럼 정의
const empHelper = createColumnHelper<Employee>();
const employeeColumns = [
  empHelper.accessor("id", { header: "ID" }),
  empHelper.accessor("name", {
    header: "이름",
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  empHelper.accessor("department", { header: "부서" }),
  empHelper.accessor("position", { header: "직책" }),
  empHelper.accessor("email", {
    header: "이메일",
    cell: (info) => (
      <span className="text-blue-600">{info.getValue()}</span>
    ),
  }),
  empHelper.accessor("joinDate", { header: "입사일" }),
  empHelper.accessor("salary", {
    header: "연봉(만원)",
    cell: (info) => info.getValue().toLocaleString(),
  }),
  empHelper.accessor("status", {
    header: "상태",
    cell: (info) => {
      const status = info.getValue();
      const colors = {
        "재직": "bg-green-100 text-green-700",
        "휴직": "bg-yellow-100 text-yellow-700",
        "퇴직": "bg-gray-100 text-gray-600",
      };
      return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}>
          {status}
        </span>
      );
    },
  }),
];

// 상품 그리드 컬럼 정의
const prodHelper = createColumnHelper<Product>();
const productColumns = [
  prodHelper.accessor("id", { header: "ID" }),
  prodHelper.accessor("name", {
    header: "상품명",
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  prodHelper.accessor("category", { header: "카테고리" }),
  prodHelper.accessor("price", {
    header: "가격",
    cell: (info) => `${info.getValue().toLocaleString()}원`,
  }),
  prodHelper.accessor("stock", {
    header: "재고",
    cell: (info) => {
      const stock = info.getValue();
      return (
        <span className={stock === 0 ? "font-medium text-red-600" : ""}>
          {stock}
        </span>
      );
    },
  }),
  prodHelper.accessor("rating", {
    header: "평점",
    cell: (info) => {
      const rating = info.getValue();
      const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
      return (
        <span className="text-yellow-500" title={`${rating}`}>
          {stars} <span className="text-xs text-gray-500">({rating})</span>
        </span>
      );
    },
  }),
  prodHelper.accessor("status", {
    header: "상태",
    cell: (info) => {
      const status = info.getValue();
      const colors = {
        "판매중": "bg-green-100 text-green-700",
        "품절": "bg-red-100 text-red-700",
        "단종": "bg-gray-100 text-gray-600",
      };
      return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}>
          {status}
        </span>
      );
    },
  }),
];

export default function GridSamplePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">그리드 샘플</h2>
        <p className="mt-1 text-sm text-gray-500">
          데이터 그리드 컴포넌트를 확인할 수 있습니다. 정렬, 검색, 페이지네이션을 지원합니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* 직원 그리드 */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">직원 관리</h3>
          <DataGrid<Employee>
            title="직원 목록"
            data={employeeData}
            columns={employeeColumns}
            pageSize={8}
          />
        </section>

        {/* 상품 그리드 */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">상품 관리</h3>
          <DataGrid<Product>
            title="상품 목록"
            data={productData}
            columns={productColumns}
            pageSize={6}
          />
        </section>
      </div>
    </div>
  );
}
