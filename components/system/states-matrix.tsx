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
    <div className="overflow-x-auto rounded-(--r-4) border border-(--line-1)">
      {/* A six-column matrix does not fit a phone, and squeezing it crushes the very
          controls it is documenting — at 390 the inputs came out 44px wide. Give the
          table a floor and let the wrapper scroll instead. */}
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-(--line-1) bg-(--surface-2)">
            <th scope="col" className="t-eyebrow p-3 text-(--text-2)">
              {caption}
            </th>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="t-eyebrow p-3 text-(--text-2)">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody data-craft-list>
          {rows.map((row) => (
            <tr key={row.key} data-craft-row className="border-b border-(--line-1) last:border-0">
              <th
                scope="row"
                className="t-meta p-3 whitespace-nowrap text-(--text-1)"
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
