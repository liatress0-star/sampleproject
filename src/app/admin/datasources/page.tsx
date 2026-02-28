"use client";

import { useState } from "react";
import {
  useDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
} from "@/lib/datasource-store";
import type { DataSourceConfig, DataSourceType, DataSourceField } from "@/lib/types";

const DS_TYPE_LABELS: Record<DataSourceType, string> = {
  table: "테이블",
  query: "SQL 쿼리",
  procedure: "프로시저",
  external: "외부 데이터",
  sample: "샘플 데이터",
};

const DS_TYPE_COLORS: Record<DataSourceType, string> = {
  table: "bg-blue-100 text-blue-700",
  query: "bg-purple-100 text-purple-700",
  procedure: "bg-teal-100 text-teal-700",
  external: "bg-orange-100 text-orange-700",
  sample: "bg-gray-100 text-gray-600",
};

const COMPAT_LABELS: Record<string, string> = {
  chart: "차트",
  pie: "파이차트",
  grid: "그리드",
  "excel-grid": "엑셀그리드",
};

export default function DataSourcesPage() {
  const { dataSources, refresh } = useDataSources();
  const [showForm, setShowForm] = useState(false);
  const [editingDs, setEditingDs] = useState<DataSourceConfig | null>(null);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dsType, setDsType] = useState<DataSourceType>("table");
  const [tableName, setTableName] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalMethod, setExternalMethod] = useState<"GET" | "POST">("GET");
  const [externalHeaders, setExternalHeaders] = useState("");
  const [compatibleWith, setCompatibleWith] = useState<string[]>(["chart"]);
  const [xAxisKeys, setXAxisKeys] = useState("");
  const [valueKeys, setValueKeys] = useState("");
  const [fields, setFields] = useState<DataSourceField[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDsType("table");
    setTableName("");
    setSqlQuery("");
    setProcedureName("");
    setExternalUrl("");
    setExternalMethod("GET");
    setExternalHeaders("");
    setCompatibleWith(["chart"]);
    setXAxisKeys("");
    setValueKeys("");
    setFields([]);
    setEditingDs(null);
    setShowForm(false);
  };

  const populateForm = (ds: DataSourceConfig) => {
    setEditingDs(ds);
    setName(ds.name);
    setDescription(ds.description);
    setDsType(ds.type);
    setTableName(ds.tableName || "");
    setSqlQuery(ds.sqlQuery || "");
    setProcedureName(ds.procedureName || "");
    setExternalUrl(ds.externalUrl || "");
    setExternalMethod(ds.externalMethod || "GET");
    setExternalHeaders(ds.externalHeaders || "");
    setCompatibleWith([...ds.compatibleWith]);
    setXAxisKeys(ds.xAxisKeys.join(", "));
    setValueKeys(ds.valueKeys.join(", "));
    setFields([...ds.fields]);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const params = {
      name: name.trim(),
      description: description.trim(),
      type: dsType,
      tableName: dsType === "table" ? tableName.trim() : undefined,
      sqlQuery: dsType === "query" ? sqlQuery.trim() : undefined,
      procedureName: dsType === "procedure" ? procedureName.trim() : undefined,
      externalUrl: dsType === "external" ? externalUrl.trim() : undefined,
      externalMethod: dsType === "external" ? externalMethod : undefined,
      externalHeaders: dsType === "external" ? externalHeaders.trim() : undefined,
      compatibleWith: compatibleWith as DataSourceConfig["compatibleWith"],
      xAxisKeys: xAxisKeys.split(",").map((s) => s.trim()).filter(Boolean),
      valueKeys: valueKeys.split(",").map((s) => s.trim()).filter(Boolean),
      fields,
    };

    if (editingDs) {
      updateDataSource(editingDs.id, params);
    } else {
      createDataSource(params as Omit<DataSourceConfig, "id" | "createdAt" | "updatedAt">);
    }
    refresh();
    resetForm();
  };

  const handleDelete = (ds: DataSourceConfig) => {
    if (ds.type === "sample") {
      if (!confirm(`"${ds.name}" 내장 샘플 데이터를 삭제하시겠습니까? 다시 시드하면 복구됩니다.`)) return;
    } else {
      if (!confirm(`"${ds.name}" 데이터소스를 삭제하시겠습니까?`)) return;
    }
    deleteDataSource(ds.id);
    refresh();
  };

  const addField = () => {
    setFields([...fields, { key: "", label: "", type: "string" }]);
  };

  const updateField = (idx: number, updates: Partial<DataSourceField>) => {
    setFields(fields.map((f, i) => (i === idx ? { ...f, ...updates } : f)));
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const toggleCompat = (val: string) => {
    setCompatibleWith((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">데이터소스 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            테이블, 쿼리, 프로시저, 외부 API 등 다양한 데이터소스를 등록하고 레이아웃 컴포넌트에서 사용할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 새 데이터소스 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-blue-800">
            {editingDs ? "데이터소스 수정" : "새 데이터소스 등록"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 이름 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">이름 *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 매출 테이블" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" autoFocus />
            </div>
            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="예: 월별 매출 실적 테이블" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* 타입 */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">데이터소스 타입 *</label>
              <div className="flex gap-2">
                {(["table", "query", "procedure", "external"] as DataSourceType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDsType(t)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      dsType === t
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {DS_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* 타입별 설정 */}
            {dsType === "table" && (
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">테이블명</label>
                <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="예: TB_SALES_MONTHLY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            )}

            {dsType === "query" && (
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">SQL 쿼리</label>
                <textarea value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} placeholder="SELECT * FROM ..." rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            )}

            {dsType === "procedure" && (
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">프로시저명</label>
                <input type="text" value={procedureName} onChange={(e) => setProcedureName(e.target.value)} placeholder="예: SP_GET_SALES_DATA" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            )}

            {dsType === "external" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">URL</label>
                  <input type="text" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://api.example.com/data" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">메서드</label>
                  <select value={externalMethod} onChange={(e) => setExternalMethod(e.target.value as "GET" | "POST")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">헤더 (JSON)</label>
                  <textarea value={externalHeaders} onChange={(e) => setExternalHeaders(e.target.value)} placeholder='{"Authorization": "Bearer ..."}' rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </>
            )}

            {/* 호환 컴포넌트 */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">호환 컴포넌트</label>
              <div className="flex gap-2">
                {Object.entries(COMPAT_LABELS).map(([val, label]) => (
                  <label
                    key={val}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      compatibleWith.includes(val) ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <input type="checkbox" checked={compatibleWith.includes(val)} onChange={() => toggleCompat(val)} className="hidden" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* X축/값 키 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">X축 키 (쉼표 구분)</label>
              <input type="text" value={xAxisKeys} onChange={(e) => setXAxisKeys(e.target.value)} placeholder="month, day" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">값 키 (쉼표 구분)</label>
              <input type="text" value={valueKeys} onChange={(e) => setValueKeys(e.target.value)} placeholder="sales, target, profit" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            {/* 필드 정의 */}
            <div className="col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">필드 정의</label>
                <button type="button" onClick={addField} className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                  + 필드 추가
                </button>
              </div>
              {fields.length === 0 ? (
                <p className="text-xs text-gray-400">필드를 추가하세요. 차트 시리즈나 그리드 컬럼에 사용됩니다.</p>
              ) : (
                <div className="space-y-2">
                  {fields.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={f.key}
                        onChange={(e) => updateField(idx, { key: e.target.value })}
                        placeholder="키 (영문)"
                        className="w-28 rounded border border-gray-300 px-2 py-1 text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="라벨"
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateField(idx, { type: e.target.value as DataSourceField["type"] })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="string">문자</option>
                        <option value="number">숫자</option>
                        <option value="date">날짜</option>
                      </select>
                      <button type="button" onClick={() => removeField(idx)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {editingDs ? "수정" : "등록"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              취소
            </button>
          </div>
        </form>
      )}

      {/* 목록 */}
      <div className="mt-6 space-y-2">
        {dataSources.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-400">등록된 데이터소스가 없습니다.</p>
          </div>
        ) : (
          dataSources.map((ds) => (
            <div
              key={ds.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${DS_TYPE_COLORS[ds.type]}`}>
                    {DS_TYPE_LABELS[ds.type]}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">{ds.name}</h3>
                  <div className="flex gap-1">
                    {ds.compatibleWith.map((c) => (
                      <span key={c} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {COMPAT_LABELS[c] || c}
                      </span>
                    ))}
                  </div>
                </div>
                {ds.description && <p className="mt-0.5 text-xs text-gray-500">{ds.description}</p>}
                <div className="mt-1 flex gap-2 text-[10px] text-gray-400">
                  {ds.tableName && <span>테이블: <code className="font-mono">{ds.tableName}</code></span>}
                  {ds.sqlQuery && <span>쿼리 정의됨</span>}
                  {ds.procedureName && <span>프로시저: <code className="font-mono">{ds.procedureName}</code></span>}
                  {ds.externalUrl && <span>{ds.externalMethod} {ds.externalUrl}</span>}
                  {ds.sampleDataKey && <span>샘플: <code className="font-mono">{ds.sampleDataKey}</code></span>}
                  <span>필드 {ds.fields.length}개</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => populateForm(ds)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(ds)}
                  className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
