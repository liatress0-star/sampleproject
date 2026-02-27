"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMenu, saveLayout, useMenus } from "@/lib/menu-store";
import type { MenuConfig, LayoutItem, ComponentInfo } from "@/lib/types";
import ComponentPalette from "@/components/admin/ComponentPalette";
import LayoutCanvas from "@/components/admin/LayoutCanvas";

export default function MenuLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const { refresh } = useMenus();

  const menuId = params.id as string;
  const [menu, setMenu] = useState<MenuConfig | null>(null);
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, setDraggingComponent] = useState<ComponentInfo | null>(null);

  useEffect(() => {
    const m = getMenu(menuId);
    if (m) {
      setMenu(m);
      setLayoutItems(m.layout);
    }
  }, [menuId]);

  const handleSave = useCallback(() => {
    if (!menuId) return;
    saveLayout(menuId, layoutItems);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [menuId, layoutItems, refresh]);

  const handleLayoutChange = useCallback((items: LayoutItem[]) => {
    setLayoutItems(items);
    setSaved(false);
  }, []);

  // Update selected item title
  const handleTitleChange = useCallback(
    (title: string) => {
      if (!selectedItemId) return;
      setLayoutItems((prev) =>
        prev.map((item) =>
          item.id === selectedItemId ? { ...item, title } : item
        )
      );
    },
    [selectedItemId]
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
        <div className="w-56 flex-shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">속성</h3>
          {selectedItem ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  제목
                </label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  컴포넌트 타입
                </label>
                <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                  {selectedItem.componentType}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">X</label>
                  <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                    {selectedItem.x}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Y</label>
                  <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                    {selectedItem.y}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">가로</label>
                  <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                    {selectedItem.width}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">세로</label>
                  <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                    {selectedItem.height}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLayoutChange(layoutItems.filter((i) => i.id !== selectedItemId));
                  setSelectedItemId(null);
                }}
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                이 컴포넌트 삭제
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              캔버스에서 컴포넌트를 선택하면 속성을 편집할 수 있습니다.
            </p>
          )}

          {/* Layout summary */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="mb-2 text-xs font-semibold text-gray-500">배치된 컴포넌트</h4>
            {layoutItems.length === 0 ? (
              <p className="text-xs text-gray-400">없음</p>
            ) : (
              <ul className="space-y-1">
                {layoutItems.map((item) => (
                  <li
                    key={item.id}
                    className={`cursor-pointer rounded px-2 py-1 text-xs transition-colors ${
                      item.id === selectedItemId
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    {item.title} ({item.width}×{item.height})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
