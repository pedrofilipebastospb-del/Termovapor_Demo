"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Empty } from "./primitives";

export type Column<T> = {
  label: string;
  render: (row: T) => ReactNode;
  align?: "right" | "center";
  width?: string;
  hint?: string;
};

// Tabela paginada com linhas navegáveis por teclado (padrão ACRS).
export function Table<T>({
  rows,
  columns,
  onRow,
  pageSize = 12,
  empty = "Nenhum registo encontrado.",
  rowKey,
  rowClass,
  footer,
}: {
  rows: T[];
  columns: Column<T>[];
  onRow?: (r: T) => void;
  pageSize?: number;
  empty?: string;
  rowKey?: (r: T) => string;
  rowClass?: (r: T) => string;
  footer?: ReactNode[];
}) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(rows.length / pageSize);
  const p = Math.min(page, Math.max(0, pages - 1));
  useEffect(() => setPage(0), [rows.length]);
  return (
    <div className="table-panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={c.hint ? "has-hint" : undefined} title={c.hint} style={{ textAlign: c.align, width: c.width }}>
                  {c.label}
                </th>
              ))}
              {onRow && <th className="arrow-col" aria-hidden />}
            </tr>
          </thead>
          <tbody>
            {rows.slice(p * pageSize, (p + 1) * pageSize).map((r, i) => (
              <tr
                key={rowKey?.(r) ?? i}
                className={`${onRow ? "interactive" : ""} ${rowClass?.(r) ?? ""}`}
                tabIndex={onRow ? 0 : undefined}
                onClick={() => onRow?.(r)}
                onKeyDown={(e) => e.key === "Enter" && onRow?.(r)}
              >
                {columns.map((c, j) => (
                  <td key={j} style={{ textAlign: c.align }}>
                    {c.render(r)}
                  </td>
                ))}
                {onRow && (
                  <td className="arrow-col">
                    <ArrowUpRight size={15} className="row-arrow" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {footer && rows.length > 0 && (
            <tfoot>
              <tr>
                {footer.map((cell, i) => (
                  <td key={i} style={{ textAlign: columns[i]?.align }}>
                    {cell}
                  </td>
                ))}
                {onRow && <td />}
              </tr>
            </tfoot>
          )}
        </table>
        {!rows.length && <Empty>{empty}</Empty>}
      </div>
      {rows.length > pageSize && (
        <div className="table-footer">
          <span>
            {p * pageSize + 1}–{Math.min((p + 1) * pageSize, rows.length)} de {rows.length} registos
          </span>
          <div className="pagination">
            <button type="button" aria-label="Página anterior" disabled={!p} onClick={() => setPage(p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span>
              {p + 1} / {pages}
            </span>
            <button type="button" aria-label="Página seguinte" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
