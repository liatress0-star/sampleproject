// 레이아웃 빌더 & 메뉴 관리 타입 정의

export type ComponentType =
  | "filter-panel"
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "area-chart"
  | "data-grid"
  | "excel-grid";

export interface ComponentInfo {
  type: ComponentType;
  label: string;
  icon: string;
  category: "필터" | "차트" | "그리드";
  defaultWidth: number;
  defaultHeight: number;
}

export const COMPONENT_REGISTRY: ComponentInfo[] = [
  { type: "filter-panel", label: "필터 패널", icon: "🔍", category: "필터", defaultWidth: 3, defaultHeight: 6 },
  { type: "bar-chart", label: "막대 차트", icon: "📊", category: "차트", defaultWidth: 6, defaultHeight: 4 },
  { type: "line-chart", label: "라인 차트", icon: "📈", category: "차트", defaultWidth: 6, defaultHeight: 4 },
  { type: "pie-chart", label: "파이 차트", icon: "🥧", category: "차트", defaultWidth: 4, defaultHeight: 4 },
  { type: "area-chart", label: "영역 차트", icon: "📉", category: "차트", defaultWidth: 6, defaultHeight: 4 },
  { type: "data-grid", label: "데이터 그리드", icon: "📋", category: "그리드", defaultWidth: 9, defaultHeight: 4 },
  { type: "excel-grid", label: "엑셀 그리드", icon: "📑", category: "그리드", defaultWidth: 9, defaultHeight: 4 },
];

// ── 데이터소스 정의 ──

export interface DataSourceField {
  key: string;
  label: string;
  type: "string" | "number";
}

export interface DataSourceInfo {
  id: string;
  label: string;
  /** 이 데이터소스를 사용할 수 있는 컴포넌트 종류 */
  compatibleWith: ("chart" | "pie" | "grid" | "excel-grid")[];
  xAxisKeys: string[];
  valueKeys: string[];
  fields: DataSourceField[];
}

export const DATA_SOURCES: DataSourceInfo[] = [
  {
    id: "monthly-sales",
    label: "월별 매출 데이터",
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
    id: "category",
    label: "카테고리별 데이터",
    compatibleWith: ["pie"],
    xAxisKeys: ["name"],
    valueKeys: ["value"],
    fields: [
      { key: "name", label: "카테고리명", type: "string" },
      { key: "value", label: "값", type: "number" },
    ],
  },
  {
    id: "weekly-visitors",
    label: "주간 방문자 데이터",
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
    id: "employee",
    label: "직원 데이터",
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
    id: "product",
    label: "제품 데이터",
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
    id: "sales-quarterly",
    label: "분기별 매출 데이터",
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

// ── 차트 시리즈 설정 ──

export interface ChartSeriesConfig {
  dataKey: string;
  name: string;
  color: string;
}

// ── 필터 항목 설정 ──

export type FilterItemType = "select" | "radio" | "text" | "date-range";

export interface FilterItemConfig {
  id: string;
  type: FilterItemType;
  label: string;
  options?: string[];       // select, radio 용
  placeholder?: string;     // text 용
}

// ── 컴포넌트별 속성 ──

export interface ChartProps {
  dataSource?: string;          // DATA_SOURCES id
  xAxisKey?: string;
  series?: ChartSeriesConfig[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface PieChartProps {
  dataSource?: string;
  showLegend?: boolean;
  innerRadius?: number;
  colors?: string[];           // 각 항목의 색상 오버라이드
}

export interface GridProps {
  dataSource?: string;
  pageSize?: number;
  enableSearch?: boolean;
}

export interface ExcelGridProps {
  dataSource?: string;
}

export interface FilterPanelProps {
  items?: FilterItemConfig[];
}

// ── 레이아웃 아이템 ──

export interface LayoutItem {
  id: string;
  componentType: ComponentType;
  x: number;      // grid column (0-11)
  y: number;      // grid row
  width: number;  // column span (1-12)
  height: number; // row span
  title: string;
  props?: Record<string, unknown>;  // 컴포넌트별 속성 (ChartProps | PieChartProps | GridProps 등)
}

// ── 기본 제공 샘플 페이지 ──

export interface SamplePageInfo {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
}

export const SAMPLE_PAGES: SamplePageInfo[] = [
  { id: "sample-dashboard", name: "대시보드", description: "메인 대시보드 화면", href: "/", icon: "🏠" },
  { id: "sample-charts", name: "차트 샘플", description: "다양한 차트 컴포넌트 데모", href: "/sample/charts", icon: "📊" },
  { id: "sample-grid", name: "그리드 샘플", description: "데이터 그리드 컴포넌트 데모", href: "/sample/grid", icon: "📋" },
  { id: "sample-excel", name: "엑셀 연동 그리드", description: "엑셀 복사/붙여넣기 지원 그리드", href: "/sample/excel-grid", icon: "📑" },
];

export type MenuType = "folder" | "menu";

export interface MenuConfig {
  id: string;
  name: string;
  description: string;
  order: number;
  menuType: MenuType;        // "folder" = 카테고리, "menu" = 실제 화면
  parentId: string | null;   // null = 최상위, 값 있으면 하위 메뉴
  released: boolean;         // true = 사용자 화면에 노출
  layout: LayoutItem[];
  createdAt: string;
  updatedAt: string;
  children?: MenuConfig[];   // 프론트엔드 트리 구성용 (DB에는 없음)
}

/** flat 메뉴 배열 → 트리 구조 변환 */
export function buildMenuTree(menus: MenuConfig[]): MenuConfig[] {
  const map = new Map<string, MenuConfig>();
  const roots: MenuConfig[] = [];

  for (const m of menus) {
    map.set(m.id, { ...m, children: [] });
  }

  for (const m of menus) {
    const node = map.get(m.id)!;
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
