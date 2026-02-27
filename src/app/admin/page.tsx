"use client";

import Link from "next/link";
import { useMenus } from "@/lib/menu-store";

export default function AdminPage() {
  const { menus } = useMenus();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">관리자 대시보드</h2>
      <p className="mt-1 text-sm text-gray-500">
        메뉴를 등록하고 각 메뉴의 화면 레이아웃을 구성할 수 있습니다.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{menus.length}</div>
          <div className="mt-1 text-sm text-gray-500">등록된 메뉴</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {menus.filter((m) => m.layout.length > 0).length}
          </div>
          <div className="mt-1 text-sm text-gray-500">레이아웃 설정 완료</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">
            {menus.reduce((sum, m) => sum + m.layout.length, 0)}
          </div>
          <div className="mt-1 text-sm text-gray-500">배치된 컴포넌트</div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/admin/menus"
          className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          메뉴 관리 바로가기 &rarr;
        </Link>
      </div>
    </div>
  );
}
