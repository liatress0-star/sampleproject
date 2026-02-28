"use client";

import { createContext, useContext } from "react";
import type { DataSourceConfig } from "./types";

const STORAGE_KEY = "web-solution-datasources";

function generateId(): string {
  return "ds_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── 내장 샘플 데이터소스 시드 ──

const BUILTIN_SAMPLE_SOURCES: Omit<DataSourceConfig, "createdAt" | "updatedAt">[] = [
  {
    id: "ds_monthly_sales",
    name: "월별 매출 데이터",
    description: "월별 매출, 목표, 이익 데이터 (내장 샘플)",
    type: "sample",
    sampleDataKey: "monthlySalesData",
    compatibleWith: ["chart"],
    xAxisKeys: ["month"],
    valueKeys: ["sales", "target", "profit"],
    fields: [
      { key: "month", label: "월", type: "string" },
      { key: "sales", label: "매출", type: "number" },
      { key: "target", label: "목표", type: "number" },
      { key: "profit", label: "이익", type: "number" },
    ],
  },
  {
    id: "ds_category",
    name: "카테고리별 데이터",
    description: "카테고리별 매출 비중 (내장 샘플)",
    type: "sample",
    sampleDataKey: "categoryData",
    compatibleWith: ["pie"],
    xAxisKeys: ["name"],
    valueKeys: ["value"],
    fields: [
      { key: "name", label: "카테고리명", type: "string" },
      { key: "value", label: "값", type: "number" },
    ],
  },
  {
    id: "ds_weekly_visitors",
    name: "주간 방문자 데이터",
    description: "요일별 방문자 수 및 페이지뷰 (내장 샘플)",
    type: "sample",
    sampleDataKey: "weeklyVisitorData",
    compatibleWith: ["chart"],
    xAxisKeys: ["day"],
    valueKeys: ["visitors", "pageViews"],
    fields: [
      { key: "day", label: "요일", type: "string" },
      { key: "visitors", label: "방문자", type: "number" },
      { key: "pageViews", label: "페이지뷰", type: "number" },
    ],
  },
  {
    id: "ds_employee",
    name: "직원 데이터",
    description: "직원 목록 - 부서, 직책, 연봉, 상태 (내장 샘플)",
    type: "sample",
    sampleDataKey: "employeeData",
    compatibleWith: ["grid"],
    xAxisKeys: [],
    valueKeys: [],
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "name", label: "이름", type: "string" },
      { key: "department", label: "부서", type: "string" },
      { key: "position", label: "직책", type: "string" },
      { key: "salary", label: "연봉(만원)", type: "number" },
      { key: "status", label: "상태", type: "string" },
    ],
  },
  {
    id: "ds_product",
    name: "제품 데이터",
    description: "제품 목록 - 가격, 재고, 평점, 판매 상태 (내장 샘플)",
    type: "sample",
    sampleDataKey: "productData",
    compatibleWith: ["grid"],
    xAxisKeys: [],
    valueKeys: [],
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "name", label: "제품명", type: "string" },
      { key: "category", label: "카테고리", type: "string" },
      { key: "price", label: "가격", type: "number" },
      { key: "stock", label: "재고", type: "number" },
      { key: "rating", label: "평점", type: "number" },
      { key: "status", label: "상태", type: "string" },
    ],
  },
  {
    id: "ds_sales_quarterly",
    name: "분기별 매출 데이터",
    description: "지역×제품 분기별 매출 (내장 샘플)",
    type: "sample",
    sampleDataKey: "salesData",
    compatibleWith: ["excel-grid"],
    xAxisKeys: [],
    valueKeys: [],
    fields: [
      { key: "region", label: "지역", type: "string" },
      { key: "product", label: "제품", type: "string" },
      { key: "q1", label: "1분기", type: "number" },
      { key: "q2", label: "2분기", type: "number" },
      { key: "q3", label: "3분기", type: "number" },
      { key: "q4", label: "4분기", type: "number" },
      { key: "total", label: "합계", type: "number" },
    ],
  },
];

// ── localStorage CRUD ──

export function loadDataSources(): DataSourceConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDataSources(sources: DataSourceConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

/** 내장 샘플 데이터소스가 없으면 자동 시드 */
export function seedBuiltinDataSources() {
  if (typeof window === "undefined") return;
  const existing = loadDataSources();
  const existingIds = new Set(existing.map((d) => d.id));
  const now = new Date().toISOString();
  let added = false;

  for (const seed of BUILTIN_SAMPLE_SOURCES) {
    if (!existingIds.has(seed.id)) {
      existing.push({ ...seed, createdAt: now, updatedAt: now });
      added = true;
    }
  }

  if (added) {
    saveDataSources(existing);
  }
}

export function getDataSource(id: string): DataSourceConfig | undefined {
  return loadDataSources().find((d) => d.id === id);
}

export function createDataSource(
  params: Omit<DataSourceConfig, "id" | "createdAt" | "updatedAt">
): DataSourceConfig {
  const sources = loadDataSources();
  const now = new Date().toISOString();
  const ds: DataSourceConfig = {
    ...params,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  sources.push(ds);
  saveDataSources(sources);
  return ds;
}

export function updateDataSource(
  id: string,
  updates: Partial<Omit<DataSourceConfig, "id" | "createdAt">>
): DataSourceConfig | undefined {
  const sources = loadDataSources();
  const idx = sources.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  sources[idx] = { ...sources[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDataSources(sources);
  return sources[idx];
}

export function deleteDataSource(id: string): boolean {
  const sources = loadDataSources();
  const filtered = sources.filter((d) => d.id !== id);
  if (filtered.length === sources.length) return false;
  saveDataSources(filtered);
  return true;
}

// ── React Context ──

interface DataSourceContextValue {
  dataSources: DataSourceConfig[];
  refresh: () => void;
}

export const DataSourceContext = createContext<DataSourceContextValue>({
  dataSources: [],
  refresh: () => {},
});

export function useDataSources() {
  return useContext(DataSourceContext);
}
