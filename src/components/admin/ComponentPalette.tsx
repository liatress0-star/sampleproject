"use client";

import { COMPONENT_REGISTRY, type ComponentInfo } from "@/lib/types";

interface ComponentPaletteProps {
  onDragStart: (component: ComponentInfo) => void;
}

export default function ComponentPalette({ onDragStart }: ComponentPaletteProps) {
  const categories = ["필터", "차트", "그리드"] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">컴포넌트</h3>
      <p className="text-xs text-gray-400">드래그하여 캔버스에 배치하세요</p>

      {categories.map((cat) => {
        const items = COMPONENT_REGISTRY.filter((c) => c.category === cat);
        return (
          <div key={cat}>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {cat}
            </div>
            <div className="space-y-1.5">
              {items.map((comp) => (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/component",
                      JSON.stringify(comp)
                    );
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(comp);
                  }}
                  className="flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:cursor-grabbing active:shadow-lg"
                >
                  <span className="text-lg">{comp.icon}</span>
                  <div>
                    <div className="font-medium text-gray-700">{comp.label}</div>
                    <div className="text-[10px] text-gray-400">
                      {comp.defaultWidth}×{comp.defaultHeight} 기본 크기
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
