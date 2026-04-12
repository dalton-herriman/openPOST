// Copyright (C) 2026 openPOST contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
