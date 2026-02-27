"use client";

import { createContext, useContext } from "react";
import type { MenuConfig, LayoutItem } from "./types";

const STORAGE_KEY = "web-solution-menus";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- localStorage CRUD ---

export function loadMenus(): MenuConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMenus(menus: MenuConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
}

export function getMenu(id: string): MenuConfig | undefined {
  return loadMenus().find((m) => m.id === id);
}

export function createMenu(name: string, description: string): MenuConfig {
  const menus = loadMenus();
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
  saveMenus(menus);
  return menu;
}

export function updateMenu(
  id: string,
  updates: Partial<Pick<MenuConfig, "name" | "description" | "order">>
): MenuConfig | undefined {
  const menus = loadMenus();
  const idx = menus.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  menus[idx] = {
    ...menus[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveMenus(menus);
  return menus[idx];
}

export function deleteMenu(id: string): boolean {
  const menus = loadMenus();
  const filtered = menus.filter((m) => m.id !== id);
  if (filtered.length === menus.length) return false;
  saveMenus(filtered);
  return true;
}

export function saveLayout(menuId: string, layout: LayoutItem[]): boolean {
  const menus = loadMenus();
  const idx = menus.findIndex((m) => m.id === menuId);
  if (idx === -1) return false;
  menus[idx].layout = layout;
  menus[idx].updatedAt = new Date().toISOString();
  saveMenus(menus);
  return true;
}

// --- React Context for triggering re-renders ---

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
