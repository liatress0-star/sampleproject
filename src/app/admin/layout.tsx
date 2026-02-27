"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { MenuContext, loadMenus } from "@/lib/menu-store";
import type { MenuConfig } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menus, setMenus] = useState<MenuConfig[]>([]);

  const refresh = useCallback(() => {
    setMenus(loadMenus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const navItems = [
    { href: "/admin", label: "관리자 홈" },
    { href: "/admin/menus", label: "메뉴 관리" },
  ];

  return (
    <MenuContext.Provider value={{ menus, refresh }}>
      <div className="flex h-screen">
        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-0 flex h-full w-60 flex-col border-r border-gray-200 bg-gray-900 text-white">
          <div className="border-b border-gray-700 px-6 py-5">
            <h1 className="text-xl font-bold">관리자</h1>
            <p className="mt-1 text-xs text-gray-400">메뉴 & 레이아웃 설정</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {menus.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  등록된 메뉴
                </div>
                {menus.map((menu) => {
                  const href = `/admin/menus/${menu.id}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={menu.id}
                      href={href}
                      className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {menu.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="border-t border-gray-700 px-3 py-4">
            <Link
              href="/"
              className="block rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              &larr; 사용자 화면으로
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="ml-60 flex-1 overflow-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </MenuContext.Provider>
  );
}
