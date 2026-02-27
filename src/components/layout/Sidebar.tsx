"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { loadMenus } from "@/lib/menu-store";
import { buildMenuTree } from "@/lib/types";
import type { MenuConfig } from "@/lib/types";

const staticNavItems = [
  { href: "/", label: "대시보드" },
  { href: "/sample/charts", label: "차트 샘플" },
  { href: "/sample/grid", label: "그리드 샘플" },
  { href: "/sample/excel-grid", label: "엑셀 연동 그리드" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [releasedTree, setReleasedTree] = useState<MenuConfig[]>([]);

  const fetchMenus = useCallback(async () => {
    const all = await loadMenus();
    const released = all.filter((m) => m.released);
    setReleasedTree(buildMenuTree(released));
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // pathname이 바뀔 때마다 메뉴 새로고침 (릴리즈 상태 반영)
  useEffect(() => {
    fetchMenus();
  }, [pathname, fetchMenus]);

  return (
    <aside className="fixed left-0 top-0 flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Web Solution</h1>
        <p className="mt-1 text-xs text-gray-500">Chart & Grid Demo</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {staticNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* 릴리즈된 메뉴 */}
        {releasedTree.length > 0 && (
          <>
            <div className="mt-4 mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              메뉴
            </div>
            {releasedTree.map((node) => (
              <SidebarMenuNode key={node.id} menu={node} pathname={pathname} depth={0} />
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-gray-200 px-3 py-4">
        <Link
          href="/admin"
          className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          관리자 &rarr;
        </Link>
      </div>
    </aside>
  );
}

function SidebarMenuNode({
  menu,
  pathname,
  depth,
}: {
  menu: MenuConfig;
  pathname: string;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = menu.menuType === "folder";
  const hasChildren = menu.children && menu.children.length > 0;
  const href = `/view/${menu.id}`;
  const isActive = pathname === href;

  if (isFolder) {
    return (
      <div style={{ paddingLeft: depth * 12 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            className={`h-3 w-3 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
          {menu.name}
        </button>
        {expanded && hasChildren && (
          <div className="space-y-0.5">
            {menu.children!.map((child) => (
              <SidebarMenuNode key={child.id} menu={child} pathname={pathname} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <Link
        href={href}
        className={`mb-0.5 block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {menu.name}
      </Link>
    </div>
  );
}
