"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMenus,
  createMenu,
  deleteMenu,
  updateMenu,
} from "@/lib/menu-store";
import type { MenuConfig, MenuType } from "@/lib/types";
import { buildMenuTree } from "@/lib/types";

export default function MenuListPage() {
  const { menus, refresh } = useMenus();
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuConfig | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [menuType, setMenuType] = useState<MenuType>("menu");
  const [parentId, setParentId] = useState<string | null>(null);

  const folders = menus.filter((m) => m.menuType === "folder");
  const tree = buildMenuTree(menus);

  const resetForm = () => {
    setName("");
    setDescription("");
    setMenuType("menu");
    setParentId(null);
    setEditingMenu(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMenu) {
      await updateMenu(editingMenu.id, {
        name: name.trim(),
        description: description.trim(),
        menuType,
        parentId,
      });
    } else {
      await createMenu({
        name: name.trim(),
        description: description.trim(),
        menuType,
        parentId,
      });
    }
    refresh();
    resetForm();
  };

  const handleEdit = (menu: MenuConfig) => {
    setEditingMenu(menu);
    setName(menu.name);
    setDescription(menu.description);
    setMenuType(menu.menuType);
    setParentId(menu.parentId);
    setShowForm(true);
  };

  const handleDelete = async (id: string, menuName: string) => {
    const hasChildren = menus.some((m) => m.parentId === id);
    if (hasChildren) {
      alert("하위 메뉴가 있는 항목은 삭제할 수 없습니다. 하위 메뉴를 먼저 삭제해주세요.");
      return;
    }
    if (!confirm(`"${menuName}" 메뉴를 삭제하시겠습니까?`)) return;
    await deleteMenu(id);
    refresh();
  };

  const handleToggleRelease = async (menu: MenuConfig) => {
    await updateMenu(menu.id, { released: !menu.released });
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">메뉴 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            메뉴를 등록하고 계층 구조를 설정할 수 있습니다. 릴리즈하면 사용자 화면에 노출됩니다.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 새 메뉴 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-blue-800">
            {editingMenu ? "메뉴 수정" : "새 메뉴 등록"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                메뉴명 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 매출 분석"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                설명
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 지역별 매출 현황을 분석합니다"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                메뉴 타입 *
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm transition-colors ${
                    menuType === "folder"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input type="radio" name="menuType" value="folder" checked={menuType === "folder"} onChange={() => setMenuType("folder")} className="hidden" />
                  <span className="text-base">&#128193;</span>
                  <div>
                    <div className="font-medium">폴더</div>
                    <div className="text-xs text-gray-400">하위 메뉴를 담는 카테고리</div>
                  </div>
                </label>
                <label
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm transition-colors ${
                    menuType === "menu"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input type="radio" name="menuType" value="menu" checked={menuType === "menu"} onChange={() => setMenuType("menu")} className="hidden" />
                  <span className="text-base">&#128196;</span>
                  <div>
                    <div className="font-medium">메뉴</div>
                    <div className="text-xs text-gray-400">레이아웃이 있는 실제 화면</div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">상위 메뉴</label>
              <select
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">최상위 (없음)</option>
                {folders
                  .filter((f) => f.id !== editingMenu?.id)
                  .map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">폴더 타입의 메뉴만 상위로 선택할 수 있습니다.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {editingMenu ? "수정" : "등록"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              취소
            </button>
          </div>
        </form>
      )}

      {/* 메뉴 트리 목록 */}
      <div className="mt-6 space-y-2">
        {menus.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-400">등록된 메뉴가 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              위의 &quot;새 메뉴 등록&quot; 버튼을 클릭하여 메뉴를 추가하세요.
            </p>
          </div>
        ) : (
          tree.map((node) => (
            <MenuTreeItem
              key={node.id}
              menu={node}
              depth={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleRelease={handleToggleRelease}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MenuTreeItem({
  menu, depth, onEdit, onDelete, onToggleRelease,
}: {
  menu: MenuConfig; depth: number;
  onEdit: (m: MenuConfig) => void; onDelete: (id: string, name: string) => void;
  onToggleRelease: (m: MenuConfig) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;
  const isFolder = menu.menuType === "folder";
  const hasDedicatedPage = !!menu.href;

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div
        className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
          menu.released ? "border-green-200" : "border-gray-200"
        }`}
      >
        <div className="flex flex-1 items-center gap-3">
          {isFolder ? (
            <button onClick={() => setExpanded(!expanded)} className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100">
              <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <span className="flex h-7 w-7 items-center justify-center text-sm text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {isFolder ? "폴더" : "메뉴"}
              </span>
              {hasDedicatedPage && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-600">샘플</span>
              )}
              <h3 className="text-sm font-semibold text-gray-900">{menu.name}</h3>
              {menu.released ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">릴리즈됨</span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">미릴리즈</span>
              )}
              {!isFolder && menu.layout.length > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  컴포넌트 {menu.layout.length}개
                </span>
              )}
            </div>
            {menu.description && <p className="mt-0.5 text-xs text-gray-500">{menu.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleRelease(menu)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              menu.released
                ? "border border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                : "border border-green-300 bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            {menu.released ? "릴리즈 해제" : "릴리즈"}
          </button>

          {!isFolder && (
            <Link href={`/admin/menus/${menu.id}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
              레이아웃 편집
            </Link>
          )}

          {hasDedicatedPage && (
            <Link href={menu.href!} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100" target="_blank">
              페이지 열기
            </Link>
          )}

          {!isFolder && !hasDedicatedPage && menu.layout.length > 0 && (
            <Link href={`/view/${menu.id}`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50" target="_blank">
              미리보기
            </Link>
          )}

          <button onClick={() => onEdit(menu)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">수정</button>
          <button onClick={() => onDelete(menu.id, menu.name)} className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">삭제</button>
        </div>
      </div>

      {isFolder && expanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {menu.children!.map((child) => (
            <MenuTreeItem key={child.id} menu={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} onToggleRelease={onToggleRelease} />
          ))}
        </div>
      )}
    </div>
  );
}
