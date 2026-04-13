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
import { ChevronRight, FolderOpen, FolderPlus, Plus, Trash2 } from "lucide-react";
import { useCollectionsStore } from "../../stores/collections-store";
import { useRequestStore } from "../../stores/request-store";
import { EmptyState } from "../shared/EmptyState";
import { cn, METHOD_COLORS } from "../../lib/utils";
import type { CollectionItem, RequestData } from "../../types";

function RequestItem({
  item,
  collectionId,
  onLoad,
}: {
  item: Extract<CollectionItem, { type: "request" }>;
  collectionId: string;
  onLoad: (request: RequestData) => void;
}) {
  const removeItem = useCollectionsStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-1.5 group px-2 py-1 hover:bg-zinc-800/50 rounded cursor-pointer">
      <span
        className={cn(
          "text-[10px] font-bold w-10 shrink-0",
          METHOD_COLORS[item.request.method],
        )}
      >
        {item.request.method.toUpperCase().slice(0, 3)}
      </span>
      <span
        className="text-xs text-zinc-300 truncate flex-1"
        onClick={() => onLoad(item.request)}
      >
        {item.request.name || item.request.url || "Untitled"}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeItem(collectionId, item.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function FolderItem({
  item,
  collectionId,
  onLoad,
}: {
  item: Extract<CollectionItem, { type: "folder" }>;
  collectionId: string;
  onLoad: (request: RequestData) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const removeItem = useCollectionsStore((s) => s.removeItem);
  const addFolder = useCollectionsStore((s) => s.addFolder);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await addFolder(collectionId, newFolderName.trim(), item.id);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  return (
    <div>
      <div className="flex items-center gap-1 group px-2 py-1 hover:bg-zinc-800/50 rounded cursor-pointer">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-500 shrink-0"
        >
          <ChevronRight
            size={12}
            className={cn("transition-transform", expanded && "rotate-90")}
          />
        </button>
        <FolderOpen size={12} className="text-zinc-500 shrink-0" />
        <span
          className="text-xs text-zinc-300 truncate flex-1"
          onClick={() => setExpanded(!expanded)}
        >
          {item.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNewFolder(true);
            setExpanded(true);
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all"
          title="New subfolder"
        >
          <FolderPlus size={10} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeItem(collectionId, item.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
        >
          <Trash2 size={10} />
        </button>
      </div>
      {expanded && (
        <div className="ml-3">
          {showNewFolder && (
            <div className="px-2 py-1">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setShowNewFolder(false);
                }}
                onBlur={() => setShowNewFolder(false)}
                placeholder="Folder name..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200 outline-none focus:border-blue-500/50"
              />
            </div>
          )}
          {item.items.length === 0 && !showNewFolder && (
            <span className="text-[10px] text-zinc-600 px-2">Empty</span>
          )}
          <CollectionItems
            items={item.items}
            collectionId={collectionId}
            onLoad={onLoad}
          />
        </div>
      )}
    </div>
  );
}

function CollectionItems({
  items,
  collectionId,
  onLoad,
}: {
  items: CollectionItem[];
  collectionId: string;
  onLoad: (request: RequestData) => void;
}) {
  return (
    <>
      {items.map((item) =>
        item.type === "request" ? (
          <RequestItem
            key={item.id}
            item={item}
            collectionId={collectionId}
            onLoad={onLoad}
          />
        ) : (
          <FolderItem
            key={item.id}
            item={item}
            collectionId={collectionId}
            onLoad={onLoad}
          />
        ),
      )}
    </>
  );
}

export function CollectionsPanel() {
  const { collections, fetch, create, remove, addFolder } =
    useCollectionsStore();
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFolderFor, setNewFolderFor] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setShowNew(false);
  };

  const handleCreateFolder = async (collectionId: string) => {
    if (!newFolderName.trim()) return;
    await addFolder(collectionId, newFolderName.trim());
    setNewFolderName("");
    setNewFolderFor(null);
  };

  if (collections.length === 0 && !showNew) {
    return (
      <EmptyState
        icon={<FolderOpen size={24} />}
        title="No collections"
        description="Create a collection to organize your requests"
        action={
          <button
            onClick={() => setShowNew(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            New Collection
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400">Collections</span>
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
            placeholder="Collection name..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      <div className="flex-1 overflow-auto px-1 py-1">
        {collections.map((col) => (
          <div key={col.id} className="mb-2">
            <div className="flex items-center gap-1.5 group px-2 py-1">
              <FolderOpen size={12} className="text-zinc-500 shrink-0" />
              <span className="text-xs font-medium text-zinc-300 truncate flex-1">
                {col.name}
              </span>
              <button
                onClick={() => {
                  setNewFolderFor(col.id);
                  setNewFolderName("");
                }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all"
                title="New folder"
              >
                <FolderPlus size={10} />
              </button>
              <button
                onClick={() => remove(col.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
            <div className="ml-3">
              {newFolderFor === col.id && (
                <div className="px-2 py-1">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder(col.id);
                      if (e.key === "Escape") setNewFolderFor(null);
                    }}
                    onBlur={() => setNewFolderFor(null)}
                    placeholder="Folder name..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200 outline-none focus:border-blue-500/50"
                  />
                </div>
              )}
              {col.items.length === 0 && newFolderFor !== col.id && (
                <span className="text-[10px] text-zinc-600 px-2">
                  No requests
                </span>
              )}
              <CollectionItems
                items={col.items}
                collectionId={col.id}
                onLoad={loadRequest}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
