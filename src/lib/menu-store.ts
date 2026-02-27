"use client";

import { createContext, useContext } from "react";
import type { MenuConfig, LayoutItem } from "./types";

const STORAGE_KEY = "web-solution-menus";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ============================================================
// localStorage 기반 (오프라인/DB 미연결 시 폴백)
// ============================================================

export function loadMenusLocal(): MenuConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMenusLocal(menus: MenuConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
}

export function getMenuLocal(id: string): MenuConfig | undefined {
  return loadMenusLocal().find((m) => m.id === id);
}

export function createMenuLocal(name: string, description: string): MenuConfig {
  const menus = loadMenusLocal();
  const menu: MenuConfig = {
    id: generateId(),
    name,
    description,
    order: menus.length,
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  menus.push(menu);
  saveMenusLocal(menus);
  return menu;
}

export function updateMenuLocal(
  id: string,
  updates: Partial<Pick<MenuConfig, "name" | "description" | "order">>,
): MenuConfig | undefined {
  const menus = loadMenusLocal();
  const idx = menus.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  menus[idx] = { ...menus[idx], ...updates, updatedAt: new Date().toISOString() };
  saveMenusLocal(menus);
  return menus[idx];
}

export function deleteMenuLocal(id: string): boolean {
  const menus = loadMenusLocal();
  const filtered = menus.filter((m) => m.id !== id);
  if (filtered.length === menus.length) return false;
  saveMenusLocal(filtered);
  return true;
}

export function saveLayoutLocal(menuId: string, layout: LayoutItem[]): boolean {
  const menus = loadMenusLocal();
  const idx = menus.findIndex((m) => m.id === menuId);
  if (idx === -1) return false;
  menus[idx].layout = layout;
  menus[idx].updatedAt = new Date().toISOString();
  saveMenusLocal(menus);
  return true;
}

// ============================================================
// API 기반 (Oracle DB 연결 시)
// ============================================================

export async function loadMenusApi(): Promise<MenuConfig[]> {
  try {
    const res = await fetch("/api/menus");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getMenuApi(id: string): Promise<MenuConfig | null> {
  try {
    const res = await fetch(`/api/menus/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createMenuApi(name: string, description: string): Promise<boolean> {
  try {
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateMenuApi(
  id: string,
  updates: Partial<Pick<MenuConfig, "name" | "description" | "order">>,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/menus/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteMenuApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveLayoutApi(menuId: string, layout: LayoutItem[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/menus/${menuId}/layout`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================
// 통합 함수 - API 우선, 실패 시 localStorage 폴백
// ============================================================

export async function loadMenus(): Promise<MenuConfig[]> {
  const apiMenus = await loadMenusApi();
  if (apiMenus.length > 0) return apiMenus;
  return loadMenusLocal();
}

export async function getMenu(id: string): Promise<MenuConfig | null> {
  const apiMenu = await getMenuApi(id);
  if (apiMenu) return apiMenu;
  return getMenuLocal(id) || null;
}

export async function createMenu(name: string, description: string): Promise<boolean> {
  const ok = await createMenuApi(name, description);
  if (!ok) {
    createMenuLocal(name, description);
  }
  return true;
}

export async function updateMenu(
  id: string,
  updates: Partial<Pick<MenuConfig, "name" | "description" | "order">>,
): Promise<boolean> {
  const ok = await updateMenuApi(id, updates);
  if (!ok) {
    updateMenuLocal(id, updates);
  }
  return true;
}

export async function deleteMenu(id: string): Promise<boolean> {
  const ok = await deleteMenuApi(id);
  if (!ok) {
    deleteMenuLocal(id);
  }
  return true;
}

export async function saveLayout(menuId: string, layout: LayoutItem[]): Promise<boolean> {
  const ok = await saveLayoutApi(menuId, layout);
  if (!ok) {
    saveLayoutLocal(menuId, layout);
  }
  return true;
}

// ============================================================
// React Context
// ============================================================

interface MenuContextValue {
  menus: MenuConfig[];
  refresh: () => void;
}

export const MenuContext = createContext<MenuContextValue>({
  menus: [],
  refresh: () => {},
});

export function useMenus() {
  return useContext(MenuContext);
}
