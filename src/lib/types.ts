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

export interface LayoutItem {
  id: string;
  componentType: ComponentType;
  x: number;      // grid column (0-11)
  y: number;      // grid row
  width: number;  // column span (1-12)
  height: number; // row span
  title: string;
}

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
