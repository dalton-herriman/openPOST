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

import { useEffect, useState } from "react";
import { Globe, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useEnvironmentsStore } from "../../stores/environments-store";
import { EmptyState } from "../shared/EmptyState";
import type { Environment, EnvVariable } from "../../types";

function EnvEditor({
  env,
  onClose,
}: {
  env: Environment;
  onClose: () => void;
}) {
  const update = useEnvironmentsStore((s) => s.update);
  const [variables, setVariables] = useState<EnvVariable[]>(
    env.variables.length > 0
      ? env.variables
      : [{ key: "", value: "", enabled: true }],
  );

  const save = async () => {
    await update({ ...env, variables: variables.filter((v) => v.key.trim()) });
    onClose();
  };

  const updateVar = (
    i: number,
    field: keyof EnvVariable,
    value: string | boolean,
  ) => {
    const updated = [...variables];
    updated[i] = { ...updated[i], [field]: value };
    setVariables(updated);
  };

  return (
    <div className="border-t border-zinc-800 px-2 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-300">{env.name}</span>
        <div className="flex gap-1">
          <button onClick={save} className="text-green-400 hover:text-green-300">
            <Check size={12} />
          </button>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={12} />
          </button>
        </div>
      </div>
      {variables.map((v, i) => (
        <div key={i} className="flex gap-1 mb-1">
          <input
            value={v.key}
            onChange={(e) => updateVar(i, "key", e.target.value)}
            placeholder="KEY"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-200 outline-none font-mono"
          />
          <input
            value={v.value}
            onChange={(e) => updateVar(i, "value", e.target.value)}
            placeholder="value"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-200 outline-none font-mono"
          />
        </div>
      ))}
      <button
        onClick={() =>
          setVariables([...variables, { key: "", value: "", enabled: true }])
        }
        className="text-[10px] text-zinc-500 hover:text-zinc-300 mt-1"
      >
        + Add variable
      </button>
    </div>
  );
}

export function EnvironmentsPanel() {
  const {
    environments,
    activeEnvironmentId,
    fetch,
    create,
    remove,
    setActive,
  } = useEnvironmentsStore();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setShowNew(false);
  };

  if (environments.length === 0 && !showNew) {
    return (
      <EmptyState
        icon={<Globe size={24} />}
        title="No environments"
        description="Create environments to manage variables"
        action={
          <button
            onClick={() => setShowNew(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            New Environment
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400">Environments</span>
        <button
          onClick={() => setShowNew(true)}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <Plus size={14} />
        </button>
      </div>

      {showNew && (
        <div className="px-3 py-2 border-b border-zinc-800">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setShowNew(false);
            }}
            placeholder="Environment name..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      <div className="flex-1 overflow-auto px-1 py-1">
        {environments.map((env) => (
          <div key={env.id}>
            <div className="flex items-center gap-1.5 group px-2 py-1.5 hover:bg-zinc-800/50 rounded">
              <input
                type="radio"
                name="active-env"
                checked={activeEnvironmentId === env.id}
                onChange={() =>
                  setActive(
                    activeEnvironmentId === env.id ? null : env.id,
                  )
                }
                className="accent-blue-500 w-3 h-3"
              />
              <span className="text-xs text-zinc-300 flex-1 truncate">
                {env.name}
              </span>
              <button
                onClick={() =>
                  setEditingId(editingId === env.id ? null : env.id)
                }
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all"
              >
                <Edit2 size={10} />
              </button>
              <button
                onClick={() => remove(env.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
            {editingId === env.id && (
              <EnvEditor env={env} onClose={() => setEditingId(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
