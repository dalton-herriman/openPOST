import { FolderOpen, Clock, Globe } from "lucide-react";
import { useUiStore, type SidebarTab } from "../../stores/ui-store";
import { CollectionsPanel } from "./CollectionsPanel";
import { HistoryPanel } from "./HistoryPanel";
import { EnvironmentsPanel } from "./EnvironmentsPanel";
import { cn } from "../../lib/utils";

const SIDEBAR_TABS: { value: SidebarTab; label: string; icon: typeof FolderOpen }[] = [
  { value: "collections", label: "Collections", icon: FolderOpen },
  { value: "history", label: "History", icon: Clock },
  { value: "environments", label: "Envs", icon: Globe },
];

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useUiStore();

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="flex border-b border-zinc-800">
        {SIDEBAR_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setSidebarTab(tab.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                sidebarTab === tab.value
                  ? "text-zinc-100 bg-zinc-900"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        {sidebarTab === "collections" && <CollectionsPanel />}
        {sidebarTab === "history" && <HistoryPanel />}
        {sidebarTab === "environments" && <EnvironmentsPanel />}
      </div>
    </div>
  );
}
