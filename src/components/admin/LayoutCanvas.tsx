"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { LayoutItem, ComponentInfo } from "@/lib/types";
import { COMPONENT_REGISTRY } from "@/lib/types";

const GRID_COLS = 12;
const GRID_ROWS = 8;
const CELL_HEIGHT = 80; // px per row

interface LayoutCanvasProps {
  items: LayoutItem[];
  onChange: (items: LayoutItem[]) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

function generateId(): string {
  return "item_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function getComponentInfo(type: string): ComponentInfo | undefined {
  return COMPONENT_REGISTRY.find((c) => c.type === type);
}

// Check collision with other items (excluding self)
function hasCollision(
  item: { x: number; y: number; width: number; height: number },
  items: LayoutItem[],
  excludeId?: string
): boolean {
  return items.some((other) => {
    if (other.id === excludeId) return false;
    const noOverlap =
      item.x + item.width <= other.x ||
      other.x + other.width <= item.x ||
      item.y + item.height <= other.y ||
      other.y + other.height <= item.y;
    return !noOverlap;
  });
}

// Clamp position within grid
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function LayoutCanvas({
  items,
  onChange,
  selectedItemId,
  onSelectItem,
}: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverCell, setDragOverCell] = useState<{ x: number; y: number } | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<ComponentInfo | null>(null);
  const [movingItem, setMovingItem] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [resizingItem, setResizingItem] = useState<{
    id: string;
    startX: number;
    startY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);

  // Convert pixel position to grid cell
  const pixelToGrid = useCallback(
    (px: number, py: number): { x: number; y: number } => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const cellWidth = rect.width / GRID_COLS;
      const x = clamp(Math.floor((px - rect.left) / cellWidth), 0, GRID_COLS - 1);
      const y = clamp(Math.floor((py - rect.top) / CELL_HEIGHT), 0, GRID_ROWS - 1);
      return { x, y };
    },
    []
  );

  // --- Drop new component from palette ---
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      const cell = pixelToGrid(e.clientX, e.clientY);
      setDragOverCell(cell);

      // Parse the component being dragged
      try {
        const raw = e.dataTransfer.types.includes("application/component");
        if (raw && !draggingComponent) {
          // We can't read data during dragOver, so we just show position
        }
      } catch {
        // ignore
      }
    },
    [pixelToGrid, draggingComponent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverCell(null);
      setDraggingComponent(null);

      const raw = e.dataTransfer.getData("application/component");
      if (!raw) return;

      try {
        const comp: ComponentInfo = JSON.parse(raw);
        const cell = pixelToGrid(e.clientX, e.clientY);

        const newItem: LayoutItem = {
          id: generateId(),
          componentType: comp.type,
          x: clamp(cell.x, 0, GRID_COLS - comp.defaultWidth),
          y: clamp(cell.y, 0, GRID_ROWS - comp.defaultHeight),
          width: comp.defaultWidth,
          height: comp.defaultHeight,
          title: comp.label,
        };

        // If collision, try to find a free spot
        if (hasCollision(newItem, items)) {
          // Try placing below
          for (let row = 0; row <= GRID_ROWS - newItem.height; row++) {
            for (let col = 0; col <= GRID_COLS - newItem.width; col++) {
              const candidate = { ...newItem, x: col, y: row };
              if (!hasCollision(candidate, items)) {
                newItem.x = col;
                newItem.y = row;
                onChange([...items, newItem]);
                onSelectItem(newItem.id);
                return;
              }
            }
          }
          // No space: still add at original position (overlap allowed as fallback)
        }

        onChange([...items, newItem]);
        onSelectItem(newItem.id);
      } catch {
        // ignore
      }
    },
    [items, onChange, onSelectItem, pixelToGrid]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);

  // --- Move item by dragging ---
  const handleItemMouseDown = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      e.preventDefault();
      onSelectItem(itemId);

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cellWidth = rect.width / GRID_COLS;
      const itemPixelX = rect.left + item.x * cellWidth;
      const itemPixelY = rect.top + item.y * CELL_HEIGHT;

      setMovingItem({
        id: itemId,
        offsetX: e.clientX - itemPixelX,
        offsetY: e.clientY - itemPixelY,
      });
    },
    [items, onSelectItem]
  );

  // --- Resize item ---
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      e.preventDefault();

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      setResizingItem({
        id: itemId,
        startX: e.clientX,
        startY: e.clientY,
        origWidth: item.width,
        origHeight: item.height,
      });
    },
    [items]
  );

  // Global mouse move/up for move and resize
  useEffect(() => {
    if (!movingItem && !resizingItem) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (movingItem) {
        const cell = pixelToGrid(
          e.clientX - movingItem.offsetX + 10,
          e.clientY - movingItem.offsetY + 10
        );
        const item = items.find((i) => i.id === movingItem.id);
        if (!item) return;

        const newX = clamp(cell.x, 0, GRID_COLS - item.width);
        const newY = clamp(cell.y, 0, GRID_ROWS - item.height);

        if (newX !== item.x || newY !== item.y) {
          const candidate = { ...item, x: newX, y: newY };
          if (!hasCollision(candidate, items, item.id)) {
            onChange(
              items.map((i) => (i.id === item.id ? { ...i, x: newX, y: newY } : i))
            );
          }
        }
      }

      if (resizingItem) {
        const item = items.find((i) => i.id === resizingItem.id);
        if (!item) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cellWidth = rect.width / GRID_COLS;
        const dx = Math.round((e.clientX - resizingItem.startX) / cellWidth);
        const dy = Math.round((e.clientY - resizingItem.startY) / CELL_HEIGHT);

        const newWidth = clamp(resizingItem.origWidth + dx, 1, GRID_COLS - item.x);
        const newHeight = clamp(resizingItem.origHeight + dy, 1, GRID_ROWS - item.y);

        if (newWidth !== item.width || newHeight !== item.height) {
          const candidate = { ...item, width: newWidth, height: newHeight };
          if (!hasCollision(candidate, items, item.id)) {
            onChange(
              items.map((i) =>
                i.id === item.id ? { ...i, width: newWidth, height: newHeight } : i
              )
            );
          }
        }
      }
    };

    const handleMouseUp = () => {
      setMovingItem(null);
      setResizingItem(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [movingItem, resizingItem, items, onChange, pixelToGrid]);

  // Delete selected item
  const handleDeleteItem = useCallback(
    (id: string) => {
      onChange(items.filter((i) => i.id !== id));
      onSelectItem(null);
    },
    [items, onChange, onSelectItem]
  );

  // Click on empty canvas deselects
  const handleCanvasClick = useCallback(() => {
    onSelectItem(null);
  }, [onSelectItem]);

  // Render grid background
  const renderGridLines = () => {
    const cells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isHighlighted = dragOverCell?.x === c && dragOverCell?.y === r;
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`border border-dashed transition-colors ${
              isHighlighted
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
            style={{
              gridColumn: `${c + 1} / ${c + 2}`,
              gridRow: `${r + 1} / ${r + 2}`,
            }}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex-1">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          캔버스 ({GRID_COLS}×{GRID_ROWS}) &middot; 컴포넌트를 드래그하여 배치
        </div>
        {selectedItemId && (
          <button
            onClick={() => handleDeleteItem(selectedItemId)}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            선택 항목 삭제
          </button>
        )}
      </div>

      <div
        ref={canvasRef}
        className="relative rounded-xl border-2 border-gray-300 bg-gray-50 overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_HEIGHT}px)`,
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
      >
        {/* Grid background */}
        {renderGridLines()}

        {/* Placed items */}
        {items.map((item) => {
          const info = getComponentInfo(item.componentType);
          const isSelected = item.id === selectedItemId;
          const isMoving = movingItem?.id === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-lg border-2 shadow-sm transition-shadow cursor-move flex flex-col ${
                isSelected
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-200 z-20"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-md z-10"
              } ${isMoving ? "opacity-80" : ""}`}
              style={{
                gridColumn: `${item.x + 1} / ${item.x + item.width + 1}`,
                gridRow: `${item.y + 1} / ${item.y + item.height + 1}`,
                position: "relative",
                backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
              }}
              onMouseDown={(e) => handleItemMouseDown(e, item.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.id);
              }}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between rounded-t-md px-3 py-1.5 text-xs font-medium ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span>
                  {info?.icon} {item.title}
                </span>
                <span className="opacity-60">
                  {item.width}×{item.height}
                </span>
              </div>

              {/* Body preview */}
              <div className="flex flex-1 items-center justify-center p-2 text-xs text-gray-400">
                {info?.label || item.componentType}
              </div>

              {/* Resize handle */}
              {isSelected && (
                <div
                  className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize rounded-sm bg-blue-500 hover:bg-blue-600"
                  onMouseDown={(e) => handleResizeMouseDown(e, item.id)}
                  title="크기 조절"
                />
              )}

              {/* Delete button */}
              {isSelected && (
                <button
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white hover:bg-red-600 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  title="삭제"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
