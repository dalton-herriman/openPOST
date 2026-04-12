import { Trash2, Plus } from "lucide-react";
import type { KeyValuePair } from "../../types";
import { cn } from "../../lib/utils";

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const updatePair = (index: number, field: keyof KeyValuePair, value: string | boolean) => {
    const updated = [...pairs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePair = (index: number) => {
    const updated = pairs.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({ key: "", value: "", enabled: true });
    }
    onChange(updated);
  };

  const addPair = () => {
    onChange([...pairs, { key: "", value: "", enabled: true }]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800">
              <th className="w-8 p-1"></th>
              <th className="text-left p-1 font-medium">{keyPlaceholder}</th>
              <th className="text-left p-1 font-medium">{valuePlaceholder}</th>
              <th className="w-8 p-1"></th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-zinc-800/50",
                  !pair.enabled && "opacity-40",
                )}
              >
                <td className="p-1 text-center">
                  <input
                    type="checkbox"
                    checked={pair.enabled}
                    onChange={(e) => updatePair(i, "enabled", e.target.checked)}
                    className="accent-blue-500 w-3 h-3"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={pair.key}
                    onChange={(e) => updatePair(i, "key", e.target.value)}
                    placeholder={keyPlaceholder}
                    className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-700 outline-none font-mono"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={pair.value}
                    onChange={(e) => updatePair(i, "value", e.target.value)}
                    placeholder={valuePlaceholder}
                    className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-700 outline-none font-mono"
                  />
                </td>
                <td className="p-1 text-center">
                  <button
                    onClick={() => removePair(i)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-800 p-1">
        <button
          onClick={addPair}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1 py-0.5"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  );
}
