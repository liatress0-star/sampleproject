"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMenu, saveLayout, useMenus } from "@/lib/menu-store";
import type { MenuConfig, LayoutItem } from "@/lib/types";
import ComponentPalette from "@/components/admin/ComponentPalette";
import LayoutCanvas from "@/components/admin/LayoutCanvas";
import PropertiesPanel from "@/components/admin/PropertiesPanel";

export default function MenuLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const { refresh } = useMenus();

  const menuId = params.id as string;
  const [menu, setMenu] = useState<MenuConfig | null>(null);
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, setDraggingComponent] = useState<import("@/lib/types").ComponentInfo | null>(null);

  useEffect(() => {
    getMenu(menuId).then((m) => {
      if (m) {
        setMenu(m);
        setLayoutItems(m.layout);
      }
    });
  }, [menuId]);

  const handleSave = useCallback(async () => {
    if (!menuId) return;
    await saveLayout(menuId, layoutItems);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [menuId, layoutItems, refresh]);

  const handleLayoutChange = useCallback((items: LayoutItem[]) => {
    setLayoutItems(items);
    setSaved(false);
  }, []);

  // 속성 패널에서 아이템 업데이트
  const handleItemUpdate = useCallback(
    (id: string, updates: Partial<LayoutItem>) => {
      setLayoutItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          // props 업데이트 시 기존 props와 병합
          if (updates.props) {
            return { ...item, ...updates, props: { ...item.props, ...updates.props } };
          }
          return { ...item, ...updates };
        })
      );
      setSaved(false);
    },
    []
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      setLayoutItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedItemId(null);
      setSaved(false);
    },
    []
  );

  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400">메뉴를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push("/admin/menus")}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          메뉴 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const selectedItem = layoutItems.find((i) => i.id === selectedItemId);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 -mx-8 -mt-8 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/menus"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; 목록
          </Link>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{menu.name}</h2>
            <p className="text-xs text-gray-400">{menu.description || "레이아웃 편집"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium animate-pulse">
              저장 완료!
            </span>
          )}
          {layoutItems.length > 0 && (
            <Link
              href={`/view/${menuId}`}
              target="_blank"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              미리보기
            </Link>
          )}
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>

      {/* Main area: palette + canvas + properties */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left: Component Palette */}
        <div className="w-52 flex-shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          <ComponentPalette onDragStart={setDraggingComponent} />
        </div>

        {/* Center: Canvas */}
        <LayoutCanvas
          items={layoutItems}
          onChange={handleLayoutChange}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
        />

        {/* Right: Properties panel */}
        <PropertiesPanel
          item={selectedItem}
          allItems={layoutItems}
          onUpdate={handleItemUpdate}
          onDelete={handleDeleteItem}
          onSelect={setSelectedItemId}
        />
      </div>
    </div>
  );
}
