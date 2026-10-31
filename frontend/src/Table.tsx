import type { ReactNode } from "react";
import type { Row } from "./api";

type Props = {
  rows: Row[];
  columns?: string[]; // defaults to the keys of the first row
  actions?: (row: Row) => ReactNode;
};

export default function Table({ rows, columns, actions }: Props) {
  if (rows.length === 0) return <p className="empty">No records found.</p>;
  const cols = columns ?? Object.keys(rows[0]);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((c) => <th key={c}>{c}</th>)}
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? row.content_id ?? i}>
              {cols.map((c) => <td key={c} title={String(row[c] ?? "")}>{String(row[c] ?? "")}</td>)}
              {actions && <td className="actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
