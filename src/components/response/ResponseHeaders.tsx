interface ResponseHeadersProps {
  headers: [string, string][];
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-zinc-500 border-b border-zinc-800">
            <th className="text-left p-2 font-medium">Name</th>
            <th className="text-left p-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {headers.map(([name, value], i) => (
            <tr key={i} className="border-b border-zinc-800/50">
              <td className="p-2 font-mono text-blue-400 whitespace-nowrap">
                {name}
              </td>
              <td className="p-2 font-mono text-zinc-300 break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
