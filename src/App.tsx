import { useEffect, useCallback, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useGitHub, type PR, type Issue, type SelectedItem } from "./hooks/use-github";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, RefreshIcon } from "@/components/icons";
import { DetailView } from "@/components/detail-view";
import { SectionBoundary } from "@/components/section-boundary";
import { ActivitySection } from "@/components/activity-section";
import { RepoSection } from "@/components/repo-section";
import { PRSection } from "@/components/pr-section";
import { IssueSection } from "@/components/issue-section";

function formatError(error: string): string {
  if (error === "gh auth login") return "Run `gh auth login` to connect GitHub.";
  if (error.includes("rate limit")) return error;
  if (error.includes("401")) return "Auth expired — run `gh auth login`.";
  if (error.includes("403")) return "Access denied — check token permissions.";
  return error;
}

export default function App() {
  const data = useGitHub();
  const { loading, error, load, refresh } = data;
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [showPrivate, setShowPrivate] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const togglePrivate = useCallback(() => setShowPrivate((v) => !v), []);
  const selectPR = useCallback((p: PR) => setSelected({ ...p, type: "pr" }), []);
  const selectIssue = useCallback((i: Issue) => setSelected({ ...i, type: "issue" }), []);
  const clearSelection = useCallback(() => setSelected(null), []);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const win = getCurrentWindow();
    const setup = async () => {
      return win.onFocusChanged(({ payload }) => {
        if (payload) load();
      });
    };
    const cleanup = setup();
    return () => {
      cleanup.then((u) => u());
    };
  }, [load]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) {
        clearSelection();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        refresh();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, clearSelection, refresh]);

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-background backdrop-blur-xl rounded-xl overflow-hidden">
        <p className="p-6 text-center text-muted-foreground">{formatError(error)}</p>
      </main>
    );
  }

  if (selected) {
    return (
      <main className="h-screen bg-background backdrop-blur-xl rounded-xl overflow-hidden">
        <SectionBoundary name="Detail">
          <DetailView item={selected} onBack={clearSelection} />
        </SectionBoundary>
      </main>
    );
  }

  const prSize = 58;
  const issueSize = 42;

  return (
    <main className="h-screen flex flex-col bg-background backdrop-blur-xl rounded-xl overflow-hidden">
      <Group orientation="horizontal" className="flex-1 min-h-0">
        <Panel defaultSize={30} minSize={20} className="flex flex-col min-h-0 min-w-0 bg-card">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold">Activity</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="opacity-50 hover:opacity-100"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={refresh}
                disabled={loading}
                className="opacity-50 hover:opacity-100 disabled:opacity-20"
              >
                <RefreshIcon />
              </Button>
            </div>
          </div>

          <Group orientation="vertical" className="flex-1 min-h-0">
            <Panel defaultSize={46} minSize={25} className="flex flex-col min-h-0 min-w-0">
              <SectionBoundary name="Activity">
                <ActivitySection
                  stats={data.stats}
                  myActivity={data.myActivity}
                  activity={data.activity}
                  loading={loading}
                />
              </SectionBoundary>
            </Panel>

            <Separator className="h-1 bg-border hover:bg-primary/40 transition-colors cursor-row-resize data-[state=dragging]:bg-primary/40" />

            <Panel defaultSize={54} minSize={25} className="flex flex-col min-h-0 min-w-0">
              <SectionBoundary name="Repositories">
                <RepoSection
                  myRepos={data.myRepos}
                  contributedTo={data.contributedTo}
                  showPrivate={showPrivate}
                  onTogglePrivate={togglePrivate}
                />
              </SectionBoundary>
            </Panel>
          </Group>
        </Panel>

        <Separator className="w-1 bg-border hover:bg-primary/40 transition-colors cursor-col-resize data-[state=dragging]:bg-primary/40" />

        <Panel defaultSize={70} minSize={30} className="flex flex-col min-h-0 min-w-0">
          <Group orientation="vertical" className="flex-1 min-h-0">
            <Panel
              defaultSize={prSize}
              minSize={10}
              className="flex flex-col min-h-0 min-w-0 bg-card"
            >
              <SectionBoundary name="Pull Requests">
                <PRSection
                  myPRs={data.myPRs}
                  reviewRequests={data.reviewRequests}
                  assignedPRs={data.assignedPRs}
                  prMentions={data.prMentions}
                  showPrivate={showPrivate}
                  loading={loading}
                  onTogglePrivate={togglePrivate}
                  onSelect={selectPR}
                />
              </SectionBoundary>
            </Panel>

            <Separator className="h-1 bg-border hover:bg-primary/40 transition-colors cursor-row-resize data-[state=dragging]:bg-primary/40" />

            <Panel
              defaultSize={issueSize}
              minSize={10}
              className="flex flex-col min-h-0 min-w-0 bg-card"
            >
              <SectionBoundary name="Issues">
                <IssueSection
                  myIssues={data.myIssues}
                  assignedIssues={data.assignedIssues}
                  issueMentions={data.issueMentions}
                  showPrivate={showPrivate}
                  loading={loading}
                  onTogglePrivate={togglePrivate}
                  onSelect={selectIssue}
                />
              </SectionBoundary>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </main>
  );
}
