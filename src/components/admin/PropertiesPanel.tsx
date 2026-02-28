"use client";

import { useCallback } from "react";
import type {
  LayoutItem,
  ChartSeriesConfig,
  FilterItemConfig,
  FilterItemType,
} from "@/lib/types";
import { useDataSources } from "@/lib/datasource-store";
import type { DataSourceConfig } from "@/lib/types";

interface PropertiesPanelProps {
  item: LayoutItem | undefined;
  allItems: LayoutItem[];
  onUpdate: (id: string, updates: Partial<LayoutItem>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

function generateFilterId(): string {
  return "f_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export default function PropertiesPanel({
  item,
  allItems,
  onUpdate,
  onDelete,
  onSelect,
}: PropertiesPanelProps) {
  const { dataSources: DATA_SOURCES } = useDataSources();
  const props = (item?.props || {}) as Record<string, unknown>;

  const updateProp = useCallback(
    (key: string, value: unknown) => {
      if (!item) return;
      onUpdate(item.id, {
        props: { ...props, [key]: value },
      });
    },
    [item, props, onUpdate]
  );

  const isChartType =
    item?.componentType === "bar-chart" ||
    item?.componentType === "line-chart" ||
    item?.componentType === "area-chart";

  const isPieChart = item?.componentType === "pie-chart";
  const isGrid = item?.componentType === "data-grid";
  const isExcelGrid = item?.componentType === "excel-grid";
  const isFilter = item?.componentType === "filter-panel";

  // 데이터소스 호환성 필터
  const compatibleSources = DATA_SOURCES.filter((ds) => {
    if (isChartType) return ds.compatibleWith.includes("chart");
    if (isPieChart) return ds.compatibleWith.includes("pie");
    if (isGrid) return ds.compatibleWith.includes("grid");
    if (isExcelGrid) return ds.compatibleWith.includes("excel-grid");
    return false;
  });

  const selectedDataSource = DATA_SOURCES.find(
    (ds) => ds.id === (props.dataSource as string)
  );

  // ── 시리즈 관련 ──
  const series = (props.series as ChartSeriesConfig[]) || [];

  const addSeries = useCallback(() => {
    if (!selectedDataSource) return;
    const usedKeys = new Set(series.map((s) => s.dataKey));
    const available = selectedDataSource.valueKeys.filter((k) => !usedKeys.has(k));
    if (available.length === 0) return;
    const key = available[0];
    const field = selectedDataSource.fields.find((f) => f.key === key);
    const newSeries: ChartSeriesConfig = {
      dataKey: key,
      name: field?.label || key,
      color: DEFAULT_COLORS[series.length % DEFAULT_COLORS.length],
    };
    updateProp("series", [...series, newSeries]);
  }, [series, selectedDataSource, updateProp]);

  const updateSeries = useCallback(
    (index: number, updates: Partial<ChartSeriesConfig>) => {
      const updated = series.map((s, i) =>
        i === index ? { ...s, ...updates } : s
      );
      updateProp("series", updated);
    },
    [series, updateProp]
  );

  const removeSeries = useCallback(
    (index: number) => {
      updateProp(
        "series",
        series.filter((_, i) => i !== index)
      );
    },
    [series, updateProp]
  );

  // ── 필터 아이템 관련 ──
  const filterItems = (props.items as FilterItemConfig[]) || [];

  const addFilterItem = useCallback(
    (type: FilterItemType) => {
      const labels: Record<FilterItemType, string> = {
        select: "선택 필터",
        radio: "라디오 필터",
        text: "텍스트 검색",
        "date-range": "기간 선택",
      };
      const newItem: FilterItemConfig = {
        id: generateFilterId(),
        type,
        label: labels[type],
        ...(type === "select" || type === "radio"
          ? { options: ["옵션1", "옵션2", "옵션3"] }
          : {}),
        ...(type === "text" ? { placeholder: "검색어를 입력하세요" } : {}),
      };
      updateProp("items", [...filterItems, newItem]);
    },
    [filterItems, updateProp]
  );

  const updateFilterItem = useCallback(
    (index: number, updates: Partial<FilterItemConfig>) => {
      const updated = filterItems.map((fi, i) =>
        i === index ? { ...fi, ...updates } : fi
      );
      updateProp("items", updated);
    },
    [filterItems, updateProp]
  );

  const removeFilterItem = useCallback(
    (index: number) => {
      updateProp(
        "items",
        filterItems.filter((_, i) => i !== index)
      );
    },
    [filterItems, updateProp]
  );

  return (
    <div className="w-64 flex-shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">속성</h3>

      {item ? (
        <div className="space-y-4">
          {/* ── 기본 속성 ── */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              제목
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              컴포넌트 타입
            </label>
            <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
              {item.componentType}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">X</label>
              <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                {item.x}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Y</label>
              <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                {item.y}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">가로</label>
              <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                {item.width}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">세로</label>
              <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-600">
                {item.height}
              </div>
            </div>
          </div>

          {/* ── 데이터소스 (차트/그리드) ── */}
          {(isChartType || isPieChart || isGrid || isExcelGrid) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-600">데이터소스</h4>
              <select
                value={(props.dataSource as string) || ""}
                onChange={(e) => {
                  const dsId = e.target.value || undefined;
                  updateProp("dataSource", dsId);
                  // 데이터소스 변경 시 시리즈 초기화
                  if (isChartType) {
                    const ds = DATA_SOURCES.find((d) => d.id === dsId);
                    if (ds) {
                      updateProp("xAxisKey", ds.xAxisKeys[0] || "");
                      const defaultSeries = ds.valueKeys.slice(0, 2).map((vk, i) => ({
                        dataKey: vk,
                        name: ds.fields.find((f) => f.key === vk)?.label || vk,
                        color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                      }));
                      updateProp("series", defaultSeries);
                    }
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">기본 데이터</option>
                {compatibleSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── 차트 X축 키 ── */}
          {isChartType && selectedDataSource && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                X축 필드
              </label>
              <select
                value={(props.xAxisKey as string) || selectedDataSource.xAxisKeys[0] || ""}
                onChange={(e) => updateProp("xAxisKey", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {selectedDataSource.fields
                  .filter((f) => f.type === "string")
                  .map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* ── 차트 시리즈 설정 ── */}
          {isChartType && (
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-600">데이터 시리즈</h4>
                <button
                  onClick={addSeries}
                  className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-200"
                >
                  + 추가
                </button>
              </div>
              {series.length === 0 ? (
                <p className="text-xs text-gray-400">
                  시리즈를 추가하세요
                </p>
              ) : (
                <div className="space-y-2">
                  {series.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-2"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-gray-500">
                          시리즈 {idx + 1}
                        </span>
                        <button
                          onClick={() => removeSeries(idx)}
                          className="text-[10px] text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {selectedDataSource && (
                          <select
                            value={s.dataKey}
                            onChange={(e) =>
                              updateSeries(idx, { dataKey: e.target.value })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            {selectedDataSource.valueKeys.map((vk) => (
                              <option key={vk} value={vk}>
                                {selectedDataSource.fields.find((f) => f.key === vk)
                                  ?.label || vk}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) =>
                            updateSeries(idx, { name: e.target.value })
                          }
                          placeholder="표시 이름"
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-gray-500">색상</label>
                          <input
                            type="color"
                            value={s.color}
                            onChange={(e) =>
                              updateSeries(idx, { color: e.target.value })
                            }
                            className="h-6 w-8 cursor-pointer rounded border border-gray-300"
                          />
                          <span className="text-[10px] text-gray-400">{s.color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 파이 차트 색상 설정 ── */}
          {isPieChart && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-600">색상 설정</h4>
              <div className="space-y-1.5">
                {((props.colors as string[]) || DEFAULT_COLORS.slice(0, 5)).map(
                  (color, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-8">#{idx + 1}</span>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const colors = [
                            ...((props.colors as string[]) ||
                              DEFAULT_COLORS.slice(0, 5)),
                          ];
                          colors[idx] = e.target.value;
                          updateProp("colors", colors);
                        }}
                        className="h-6 w-8 cursor-pointer rounded border border-gray-300"
                      />
                      <span className="text-[10px] text-gray-400">{color}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  내부 반지름 (도넛)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={(props.innerRadius as number) ?? 0}
                  onChange={(e) =>
                    updateProp("innerRadius", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-0.5 text-[10px] text-gray-400">
                  0=파이, 60~80=도넛
                </p>
              </div>
            </div>
          )}

          {/* ── 범례 표시 (차트 공통) ── */}
          {(isChartType || isPieChart) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-600">표시 옵션</h4>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(props.showLegend as boolean) ?? true}
                  onChange={(e) => updateProp("showLegend", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs text-gray-600">범례 표시</span>
              </label>
              {isChartType && (
                <label className="mt-1.5 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(props.showGrid as boolean) ?? true}
                    onChange={(e) => updateProp("showGrid", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600">그리드 선 표시</span>
                </label>
              )}
            </div>
          )}

          {/* ── 그리드 속성 ── */}
          {isGrid && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-600">그리드 설정</h4>
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    페이지 크기
                  </label>
                  <select
                    value={(props.pageSize as number) ?? 5}
                    onChange={(e) =>
                      updateProp("pageSize", Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value={5}>5행</option>
                    <option value={10}>10행</option>
                    <option value={15}>15행</option>
                    <option value={20}>20행</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(props.enableSearch as boolean) ?? true}
                    onChange={(e) =>
                      updateProp("enableSearch", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600">검색 기능</span>
                </label>
              </div>
            </div>
          )}

          {/* ── 필터 패널 아이템 설정 ── */}
          {isFilter && (
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-600">필터 항목</h4>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-1">
                <button
                  onClick={() => addFilterItem("select")}
                  className="rounded bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  + 드롭다운
                </button>
                <button
                  onClick={() => addFilterItem("radio")}
                  className="rounded bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-200"
                >
                  + 라디오
                </button>
                <button
                  onClick={() => addFilterItem("text")}
                  className="rounded bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700 hover:bg-amber-200"
                >
                  + 텍스트
                </button>
                <button
                  onClick={() => addFilterItem("date-range")}
                  className="rounded bg-rose-100 px-2 py-1 text-[10px] font-medium text-rose-700 hover:bg-rose-200"
                >
                  + 날짜 기간
                </button>
              </div>

              {filterItems.length === 0 ? (
                <p className="text-xs text-gray-400">
                  필터 항목을 추가하세요
                </p>
              ) : (
                <div className="space-y-2">
                  {filterItems.map((fi, idx) => (
                    <div
                      key={fi.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-2"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-gray-500">
                          {fi.type === "select" && "드롭다운"}
                          {fi.type === "radio" && "라디오 버튼"}
                          {fi.type === "text" && "텍스트 입력"}
                          {fi.type === "date-range" && "날짜 기간"}
                        </span>
                        <button
                          onClick={() => removeFilterItem(idx)}
                          className="text-[10px] text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={fi.label}
                          onChange={(e) =>
                            updateFilterItem(idx, { label: e.target.value })
                          }
                          placeholder="라벨"
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        {fi.type === "text" && (
                          <input
                            type="text"
                            value={fi.placeholder || ""}
                            onChange={(e) =>
                              updateFilterItem(idx, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="플레이스홀더"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                        )}
                        {(fi.type === "select" || fi.type === "radio") && (
                          <div>
                            <label className="text-[10px] text-gray-500">
                              옵션 (쉼표로 구분)
                            </label>
                            <input
                              type="text"
                              value={(fi.options || []).join(", ")}
                              onChange={(e) =>
                                updateFilterItem(idx, {
                                  options: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 삭제 버튼 */}
          <button
            onClick={() => onDelete(item.id)}
            className="w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            이 컴포넌트 삭제
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          캔버스에서 컴포넌트를 선택하면 속성을 편집할 수 있습니다.
        </p>
      )}

      {/* Layout summary */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="mb-2 text-xs font-semibold text-gray-500">배치된 컴포넌트</h4>
        {allItems.length === 0 ? (
          <p className="text-xs text-gray-400">없음</p>
        ) : (
          <ul className="space-y-1">
            {allItems.map((it) => (
              <li
                key={it.id}
                className={`cursor-pointer rounded px-2 py-1 text-xs transition-colors ${
                  it.id === item?.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => onSelect(it.id)}
              >
                {it.title} ({it.width}x{it.height})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
