"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { MenuContext, loadMenus, seedSampleMenus } from "@/lib/menu-store";
import { DataSourceContext, loadDataSources, seedBuiltinDataSources } from "@/lib/datasource-store";
import { buildMenuTree } from "@/lib/types";
import type { MenuConfig } from "@/lib/types";
import type { DataSourceConfig } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);

  const refreshMenus = useCallback(() => {
    seedSampleMenus();
    loadMenus().then(setMenus);
  }, []);

  const refreshDataSources = useCallback(() => {
    seedBuiltinDataSources();
    setDataSources(loadDataSources());
  }, []);

  useEffect(() => {
    refreshMenus();
    refreshDataSources();
  }, [refreshMenus, refreshDataSources]);

  const navItems = [
    { href: "/admin", label: "관리자 홈" },
    { href: "/admin/menus", label: "메뉴 관리" },
    { href: "/admin/datasources", label: "데이터소스 관리" },
  ];

  const tree = buildMenuTree(menus);

  return (
    <MenuContext.Provider value={{ menus, refresh: refreshMenus }}>
      <DataSourceContext.Provider value={{ dataSources, refresh: refreshDataSources }}>
        <div className="flex h-screen">
          {/* Admin Sidebar */}
          <aside className="fixed left-0 top-0 flex h-full w-60 flex-col border-r border-gray-200 bg-gray-900 text-white">
            <div className="border-b border-gray-700 px-6 py-5">
              <h1 className="text-xl font-bold">관리자</h1>
              <p className="mt-1 text-xs text-gray-400">메뉴 & 레이아웃 설정</p>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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

              {tree.length > 0 && (
                <>
                  <div className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    등록된 메뉴
                  </div>
                  {tree.map((node) => (
                    <AdminSidebarNode key={node.id} menu={node} pathname={pathname} depth={0} />
                  ))}
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
      </DataSourceContext.Provider>
    </MenuContext.Provider>
  );
}

function AdminSidebarNode({
  menu, pathname, depth,
}: {
  menu: MenuConfig; pathname: string; depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = menu.menuType === "folder";
  const hasChildren = menu.children && menu.children.length > 0;

  if (isFolder) {
    return (
      <div style={{ paddingLeft: depth * 10 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          <svg className={`h-3 w-3 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          {menu.name}
        </button>
        {expanded && hasChildren && (
          <div>
            {menu.children!.map((child) => (
              <AdminSidebarNode key={child.id} menu={child} pathname={pathname} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const href = `/admin/menus/${menu.id}`;
  const isActive = pathname === href;

  return (
    <div style={{ paddingLeft: depth * 10 }}>
      <Link
        href={href}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
          isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span className="truncate">{menu.name}</span>
        {menu.released && (
          <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
        )}
      </Link>
    </div>
  );
}
