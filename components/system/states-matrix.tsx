export interface MatrixRow {
  key: string;
  label: string;
}

export interface MatrixColumn {
  key: string;
  label: string;
}

export function StatesMatrix({
  caption,
  rows,
  columns,
  render,
}: {
  caption: string;
  rows: MatrixRow[];
  columns: MatrixColumn[];
  render: (rowKey: string, colKey: string) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-(--radius-control) border border-(--border-1)">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-(--border-1) bg-(--surface-2)">
            <th scope="col" className="p-3 text-(length:--text-meta) font-medium text-(--text-2)">
              {caption}
            </th>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="p-3 text-(length:--text-meta) font-medium text-(--text-2)">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-(--border-1) last:border-0">
              <th
                scope="row"
                className="p-3 text-(length:--text-meta) font-medium whitespace-nowrap text-(--text-1)"
              >
                {row.label}
              </th>
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {render(row.key, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
