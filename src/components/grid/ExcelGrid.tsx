"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";

export interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
  editable?: boolean;
  type?: "text" | "number";
}

interface CellAddress {
  row: number;
  col: number;
}

interface SelectionRange {
  start: CellAddress;
  end: CellAddress;
}

interface ExcelGridProps {
  data: Record<string, string | number>[];
  columns: ExcelColumn[];
  title?: string;
  onChange?: (data: Record<string, string | number>[]) => void;
}

function normalizeRange(range: SelectionRange) {
  return {
    minRow: Math.min(range.start.row, range.end.row),
    maxRow: Math.max(range.start.row, range.end.row),
    minCol: Math.min(range.start.col, range.end.col),
    maxCol: Math.max(range.start.col, range.end.col),
  };
}

export default function ExcelGrid({
  data: initialData,
  columns,
  title,
  onChange,
}: ExcelGridProps) {
  const [data, setData] = useState(initialData);
  const [activeCell, setActiveCell] = useState<CellAddress | null>(null);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingCell, setEditingCell] = useState<CellAddress | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sync with external data changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Focus input when editing
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const updateData = useCallback(
    (newData: Record<string, string | number>[]) => {
      setData(newData);
      onChange?.(newData);
    },
    [onChange]
  );

  const isCellSelected = useCallback(
    (row: number, col: number) => {
      if (!selection) return false;
      const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    },
    [selection]
  );

  const isCellActive = useCallback(
    (row: number, col: number) => {
      return activeCell?.row === row && activeCell?.col === col;
    },
    [activeCell]
  );

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const col = columns[editingCell.col];
    const newData = [...data];
    newData[editingCell.row] = { ...newData[editingCell.row] };
    if (col.type === "number") {
      const num = Number(editValue);
      newData[editingCell.row][col.key] = isNaN(num) ? 0 : num;
    } else {
      newData[editingCell.row][col.key] = editValue;
    }
    updateData(newData);
    setEditingCell(null);
  }, [editingCell, editValue, columns, data, updateData]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const startEditing = useCallback(
    (row: number, col: number) => {
      const column = columns[col];
      if (column.editable === false) return;
      setEditingCell({ row, col });
      setEditValue(String(data[row][column.key] ?? ""));
    },
    [columns, data]
  );

  // --- Mouse handlers for drag selection ---
  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (editingCell) {
        commitEdit();
      }
      const addr = { row, col };
      if (e.shiftKey && activeCell) {
        // Extend selection
        setSelection({ start: activeCell, end: addr });
      } else {
        setActiveCell(addr);
        setSelection({ start: addr, end: addr });
      }
      setIsDragging(true);
    },
    [activeCell, editingCell, commitEdit]
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isDragging || !selection) return;
      setSelection((prev) =>
        prev ? { start: prev.start, end: { row, col } } : null
      );
    },
    [isDragging, selection]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // --- Copy: selected cells → TSV clipboard ---
  const copySelectionToClipboard = useCallback(async () => {
    if (!selection) return;
    const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
    const lines: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const cells: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        cells.push(String(data[r][columns[c].key] ?? ""));
      }
      lines.push(cells.join("\t"));
    }
    const tsv = lines.join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      const rowCount = maxRow - minRow + 1;
      const colCount = maxCol - minCol + 1;
      setCopyFeedback(`${rowCount}행 × ${colCount}열 복사됨`);
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = tsv;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [selection, data, columns]);

  // --- Paste: TSV clipboard → grid starting from active cell ---
  const pasteFromClipboard = useCallback(
    async (clipboardText?: string) => {
      if (!activeCell) return;
      let text = clipboardText;
      if (!text) {
        try {
          text = await navigator.clipboard.readText();
        } catch {
          return;
        }
      }
      if (!text) return;

      const rows = text.split(/\r?\n/).filter((line) => line.length > 0);
      const newData = [...data];
      let pastedRows = 0;
      let pastedCols = 0;

      for (let r = 0; r < rows.length; r++) {
        const targetRow = activeCell.row + r;
        if (targetRow >= newData.length) break;
        const cells = rows[r].split("\t");
        pastedCols = Math.max(pastedCols, cells.length);
        newData[targetRow] = { ...newData[targetRow] };
        for (let c = 0; c < cells.length; c++) {
          const targetCol = activeCell.col + c;
          if (targetCol >= columns.length) break;
          const col = columns[targetCol];
          if (col.editable === false) continue;
          if (col.type === "number") {
            const num = Number(cells[c]);
            newData[targetRow][col.key] = isNaN(num) ? 0 : num;
          } else {
            newData[targetRow][col.key] = cells[c];
          }
        }
        pastedRows++;
      }

      updateData(newData);

      // Highlight pasted range
      setSelection({
        start: activeCell,
        end: {
          row: Math.min(activeCell.row + pastedRows - 1, data.length - 1),
          col: Math.min(activeCell.col + pastedCols - 1, columns.length - 1),
        },
      });
      setCopyFeedback(`${pastedRows}행 × ${pastedCols}열 붙여넣기 완료`);
      setTimeout(() => setCopyFeedback(""), 2000);
    },
    [activeCell, data, columns, updateData]
  );

  // --- Keyboard handler ---
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copySelectionToClipboard();
        return;
      }

      // Ctrl+V / Cmd+V (handled in onPaste for content)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        // Let the native paste event handle it
        return;
      }

      // Ctrl+A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        setSelection({
          start: { row: 0, col: 0 },
          end: { row: data.length - 1, col: columns.length - 1 },
        });
        return;
      }

      if (editingCell) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          // Move down
          if (editingCell.row < data.length - 1) {
            const next = { row: editingCell.row + 1, col: editingCell.col };
            setActiveCell(next);
            setSelection({ start: next, end: next });
          }
        } else if (e.key === "Escape") {
          cancelEdit();
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          const nextCol = e.shiftKey ? editingCell.col - 1 : editingCell.col + 1;
          if (nextCol >= 0 && nextCol < columns.length) {
            const next = { row: editingCell.row, col: nextCol };
            setActiveCell(next);
            setSelection({ start: next, end: next });
          }
        }
        return;
      }

      if (!activeCell) return;

      const move = (dr: number, dc: number) => {
        e.preventDefault();
        const newRow = Math.max(0, Math.min(data.length - 1, activeCell.row + dr));
        const newCol = Math.max(0, Math.min(columns.length - 1, activeCell.col + dc));
        const next = { row: newRow, col: newCol };
        if (e.shiftKey && selection) {
          setSelection({ start: selection.start, end: next });
        } else {
          setSelection({ start: next, end: next });
        }
        setActiveCell(next);
      };

      switch (e.key) {
        case "ArrowUp":
          move(-1, 0);
          break;
        case "ArrowDown":
          move(1, 0);
          break;
        case "ArrowLeft":
          move(0, -1);
          break;
        case "ArrowRight":
          move(0, 1);
          break;
        case "Tab":
          move(0, e.shiftKey ? -1 : 1);
          break;
        case "Enter":
          e.preventDefault();
          startEditing(activeCell.row, activeCell.col);
          break;
        case "F2":
          e.preventDefault();
          startEditing(activeCell.row, activeCell.col);
          break;
        case "Delete":
        case "Backspace":
          if (selection) {
            e.preventDefault();
            const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
            const newData = [...data];
            for (let r = minRow; r <= maxRow; r++) {
              newData[r] = { ...newData[r] };
              for (let c = minCol; c <= maxCol; c++) {
                const col = columns[c];
                if (col.editable === false) continue;
                newData[r][col.key] = col.type === "number" ? 0 : "";
              }
            }
            updateData(newData);
          }
          break;
        default:
          // Start editing on printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const col = columns[activeCell.col];
            if (col.editable !== false) {
              setEditingCell(activeCell);
              setEditValue(e.key);
            }
          }
      }
    },
    [
      activeCell,
      editingCell,
      selection,
      data,
      columns,
      copySelectionToClipboard,
      commitEdit,
      cancelEdit,
      startEditing,
      updateData,
    ]
  );

  // Native paste handler
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (editingCell) return; // Let native input handle it
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      pasteFromClipboard(text);
    },
    [editingCell, pasteFromClipboard]
  );

  const getCellClasses = (row: number, col: number) => {
    const isSelected = isCellSelected(row, col);
    const isActive = isCellActive(row, col);
    const base = "px-3 py-2 text-sm border-r border-b border-gray-200 relative";

    if (isActive) {
      return `${base} outline-2 outline-blue-500 outline -outline-offset-1 bg-white z-10`;
    }
    if (isSelected) {
      return `${base} bg-blue-50`;
    }
    return `${base} bg-white`;
  };

  // Selection overlay border
  const getSelectionBorder = () => {
    if (!selection) return null;
    const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
    const table = containerRef.current?.querySelector("table");
    if (!table) return null;
    const tbody = table.querySelector("tbody");
    if (!tbody) return null;

    const rows = tbody.querySelectorAll("tr");
    if (rows.length === 0) return null;

    const firstCell = rows[minRow]?.querySelectorAll("td")[minCol];
    const lastCell = rows[maxRow]?.querySelectorAll("td")[maxCol];
    if (!firstCell || !lastCell) return null;

    const tableRect = table.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    return {
      top: firstRect.top - tableRect.top,
      left: firstRect.left - tableRect.left,
      width: lastRect.right - firstRect.left,
      height: lastRect.bottom - firstRect.top,
    };
  };

  const selectionBorder = getSelectionBorder();

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="rounded bg-gray-100 px-2 py-0.5">Ctrl+C</span>
            <span>복사</span>
            <span className="rounded bg-gray-100 px-2 py-0.5">Ctrl+V</span>
            <span>붙여넣기</span>
            <span className="rounded bg-gray-100 px-2 py-0.5">Ctrl+A</span>
            <span>전체선택</span>
          </div>
        </div>
        {copyFeedback && (
          <div className="animate-pulse rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600">
            {copyFeedback}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-auto">
        <table
          className="w-full border-collapse select-none"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 48 }} />
            {columns.map((col, i) => (
              <col key={i} style={{ width: col.width || 150 }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-50">
              <th className="border-r border-b border-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-20">
                #
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="border-r border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0 bg-gray-50 z-20"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="group">
                {/* Row number */}
                <td className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2 text-center text-xs text-gray-400 select-none">
                  {rowIdx + 1}
                </td>
                {columns.map((col, colIdx) => {
                  const isEditing =
                    editingCell?.row === rowIdx && editingCell?.col === colIdx;

                  return (
                    <td
                      key={colIdx}
                      className={getCellClasses(rowIdx, colIdx)}
                      onMouseDown={(e) => handleCellMouseDown(rowIdx, colIdx, e)}
                      onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                      onDoubleClick={() => startEditing(rowIdx, colIdx)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type={col.type === "number" ? "number" : "text"}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          className="absolute inset-0 w-full h-full px-3 py-2 text-sm border-2 border-blue-500 outline-none bg-white z-30"
                        />
                      ) : (
                        <span className="block truncate">
                          {col.type === "number"
                            ? Number(row[col.key]).toLocaleString()
                            : String(row[col.key] ?? "")}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Selection border overlay */}
        {selectionBorder && selection && (() => {
          const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
          const isMulti = minRow !== maxRow || minCol !== maxCol;
          if (!isMulti) return null;
          return (
            <div
              className="pointer-events-none absolute border-2 border-blue-500"
              style={{
                top: selectionBorder.top,
                left: selectionBorder.left,
                width: selectionBorder.width,
                height: selectionBorder.height,
              }}
            />
          );
        })()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
        <span>총 {data.length}행 × {columns.length}열</span>
        {selection && (() => {
          const { minRow, maxRow, minCol, maxCol } = normalizeRange(selection);
          const selectedRows = maxRow - minRow + 1;
          const selectedCols = maxCol - minCol + 1;
          if (selectedRows === 1 && selectedCols === 1) {
            return <span>셀: {columns[minCol].header} ({minRow + 1}행)</span>;
          }
          return (
            <span>
              선택: {selectedRows}행 × {selectedCols}열 ({selectedRows * selectedCols}셀)
            </span>
          );
        })()}
      </div>
    </div>
  );
}
