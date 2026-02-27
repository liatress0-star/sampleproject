"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMenu } from "@/lib/menu-store";
import type { MenuConfig } from "@/lib/types";
import LayoutRenderer from "@/components/admin/LayoutRenderer";

export default function ViewPage() {
  const params = useParams();
  const menuId = params.menuId as string;
  const [menu, setMenu] = useState<MenuConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu(menuId).then((m) => {
      setMenu(m || null);
      setLoading(false);
    });
  }, [menuId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-gray-400">메뉴를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 text-sm text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{menu.name}</h1>
            {menu.description && (
              <p className="mt-0.5 text-sm text-gray-500">{menu.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/menus/${menu.id}`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              레이아웃 편집
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              홈
            </Link>
          </div>
        </div>
      </header>
      <main className="p-6">
        <LayoutRenderer items={menu.layout} />
      </main>
    </div>
  );
}
