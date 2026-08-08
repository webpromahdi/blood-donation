export default function Table({ columns = [], data = [], renderRow, empty = 'No records found.' }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60">
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {renderRow(row, i)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Td({ className = '', children }) {
  return (
    <td className={`px-4 py-3 text-gray-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  )
}
