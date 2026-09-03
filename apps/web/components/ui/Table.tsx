import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
}

/**
 * Wrapped in its own overflow-x container so a wide admin table never
 * forces the page itself to scroll sideways.
 */
export function Table<T>({ columns, rows, getRowId, emptyMessage = "No records found." }: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded border border-line bg-parchment p-8 text-center text-sm text-ink-soft">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-line bg-parchment">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "border-b border-line-strong px-4 py-3 font-mono text-[10.5px] uppercase tracking-wider text-bark",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)} className="hover:bg-paper-deep">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "border-b border-line px-4 py-3",
                    col.align === "right" && "text-right tabular-nums"
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
