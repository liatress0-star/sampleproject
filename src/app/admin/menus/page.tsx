"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMenus,
  createMenu,
  deleteMenu,
  updateMenu,
} from "@/lib/menu-store";
import type { MenuConfig } from "@/lib/types";

export default function MenuListPage() {
  const { menus, refresh } = useMenus();
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuConfig | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingMenu(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMenu) {
      await updateMenu(editingMenu.id, { name: name.trim(), description: description.trim() });
    } else {
      await createMenu(name.trim(), description.trim());
    }
    refresh();
    resetForm();
  };

  const handleEdit = (menu: MenuConfig) => {
    setEditingMenu(menu);
    setName(menu.name);
    setDescription(menu.description);
    setShowForm(true);
  };

  const handleDelete = async (id: string, menuName: string) => {
    if (!confirm(`"${menuName}" 메뉴를 삭제하시겠습니까?`)) return;
    await deleteMenu(id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">메뉴 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            메뉴를 등록하고 각 메뉴의 화면 레이아웃을 설정할 수 있습니다.
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
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {editingMenu ? "수정" : "등록"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 메뉴 목록 */}
      <div className="mt-6 space-y-3">
        {menus.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-400">등록된 메뉴가 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              위의 &quot;새 메뉴 등록&quot; 버튼을 클릭하여 메뉴를 추가하세요.
            </p>
          </div>
        ) : (
          menus.map((menu) => (
            <div
              key={menu.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {menu.name}
                  </h3>
                  {menu.layout.length > 0 ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      컴포넌트 {menu.layout.length}개
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      레이아웃 미설정
                    </span>
                  )}
                </div>
                {menu.description && (
                  <p className="mt-1 text-sm text-gray-500">{menu.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  수정: {new Date(menu.updatedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/menus/${menu.id}`}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  레이아웃 편집
                </Link>
                {menu.layout.length > 0 && (
                  <Link
                    href={`/view/${menu.id}`}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    target="_blank"
                  >
                    미리보기
                  </Link>
                )}
                <button
                  onClick={() => handleEdit(menu)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(menu.id, menu.name)}
                  className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
