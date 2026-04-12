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

import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { TitleBar } from "./components/layout/TitleBar";
import { StatusBar } from "./components/layout/StatusBar";
import { Sidebar } from "./components/sidebar/Sidebar";
import { RequestPanel } from "./components/request/RequestPanel";
import { ResponsePanel } from "./components/response/ResponsePanel";
import { useUiStore } from "./stores/ui-store";
import { useCollectionsStore } from "./stores/collections-store";
import { useHistoryStore } from "./stores/history-store";
import { useEnvironmentsStore } from "./stores/environments-store";

export default function App() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const fetchCollections = useCollectionsStore((s) => s.fetch);
  const fetchHistory = useHistoryStore((s) => s.fetch);
  const fetchEnvironments = useEnvironmentsStore((s) => s.fetch);

  useEffect(() => {
    fetchCollections();
    fetchHistory();
    fetchEnvironments();
  }, [fetchCollections, fetchHistory, fetchEnvironments]);

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-zinc-100">
      <TitleBar />
      <Group orientation="horizontal" className="flex-1">
        {!sidebarCollapsed && (
          <>
            <Panel defaultSize="240px" minSize="200px" maxSize="400px">
              <Sidebar />
            </Panel>
            <Separator className="w-px bg-zinc-800 hover:bg-blue-500 transition-colors" />
          </>
        )}
        <Panel defaultSize={sidebarCollapsed ? 100 : 80}>
          <Group orientation="vertical">
            <Panel defaultSize={50} minSize={25}>
              <RequestPanel />
            </Panel>
            <Separator className="h-px bg-zinc-800 hover:bg-blue-500 transition-colors" />
            <Panel defaultSize={50} minSize={20}>
              <ResponsePanel />
            </Panel>
          </Group>
        </Panel>
      </Group>
      <StatusBar />
    </div>
  );
}
