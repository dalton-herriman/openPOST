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

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 py-1 border-t border-zinc-800 bg-zinc-950 text-[10px] text-zinc-600">
      <span>openPOST v0.1.0</span>
      <span>Ready</span>
    </div>
  );
}
