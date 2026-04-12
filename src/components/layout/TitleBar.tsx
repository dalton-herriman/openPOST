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

import { PanelLeftClose, PanelLeftOpen, Save } from "lucide-react";
import { useUiStore } from "../../stores/ui-store";
import { useRequestStore } from "../../stores/request-store";
import { useCollectionsStore } from "../../stores/collections-store";
import { useEnvironmentsStore } from "../../stores/environments-store";

export function TitleBar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const { collections, addItem } = useCollectionsStore();
  const { environments, activeEnvironmentId, setActive } =
    useEnvironmentsStore();

  const handleSaveToCollection = async () => {
    if (collections.length === 0) return;
    await addItem(collections[0].id, activeRequest);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950 select-none"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
        <span className="text-sm font-semibold text-zinc-100">openPOST</span>
        <span className="text-[10px] text-zinc-600 font-mono">v0.1.0</span>
      </div>

      <div className="flex items-center gap-2">
        {collections.length > 0 && (
          <button
            onClick={handleSaveToCollection}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Save to first collection"
          >
            <Save size={12} />
            Save
          </button>
        )}

        <select
          value={activeEnvironmentId ?? ""}
          onChange={(e) => setActive(e.target.value || null)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 outline-none cursor-pointer"
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
