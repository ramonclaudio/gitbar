import { memo } from "react";
import { open } from "@tauri-apps/plugin-shell";
import type { MyActivity } from "@/hooks/use-github";
import { timeAgo } from "@/lib/time";
import { PRIcon, IssueIcon, ForkIcon, StarIcon, CommentIcon, EyeIcon } from "@/components/icons";

function ActivityText({ a }: { a: MyActivity }) {
  switch (a.type) {
    case "push":
      return (
        <>
          pushed {a.commits} {a.commits === 1 ? "commit" : "commits"} to{" "}
          <span className="font-mono text-primary">{a.ref}</span>
        </>
      );
    case "pr":
      return (
        <>
          {a.action} PR{" "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => a.url && open(a.url)}
          >
            {a.title}
          </span>
        </>
      );
    case "issue":
      return (
        <>
          {a.action} issue{" "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => a.url && open(a.url)}
          >
            {a.title}
          </span>
        </>
      );
    case "review":
      return (
        <>
          reviewed{" "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => a.url && open(a.url)}
          >
            {a.title}
          </span>
        </>
      );
    case "comment":
      return (
        <span className="cursor-pointer hover:text-primary" onClick={() => a.url && open(a.url)}>
          commented
        </span>
      );
    case "create":
      return (
        <>
          created {a.refType} <span className="font-mono text-primary">{a.ref}</span>
        </>
      );
    case "delete":
      return (
        <>
          deleted {a.refType} <span className="font-mono text-muted-foreground">{a.ref}</span>
        </>
      );
    case "fork":
      return (
        <>
          forked to{" "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => a.url && open(a.url)}
          >
            {a.title}
          </span>
        </>
      );
    case "star":
      return <>starred</>;
    case "release":
      return (
        <>
          {a.action} release{" "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => a.url && open(a.url)}
          >
            {a.title}
          </span>
        </>
      );
    default:
      return <>{a.type}</>;
  }
}

function ActivityIcon({ type }: { type: MyActivity["type"] }) {
  switch (type) {
    case "push":
      return <span className="text-[10px]">⬆</span>;
    case "pr":
      return <PRIcon />;
    case "issue":
      return <IssueIcon />;
    case "review":
      return <EyeIcon />;
    case "comment":
      return <CommentIcon />;
    case "create":
      return <span className="text-[10px]">+</span>;
    case "delete":
      return <span className="text-[10px]">−</span>;
    case "fork":
      return <ForkIcon />;
    case "star":
      return <StarIcon />;
    case "release":
      return <span className="text-[10px]">🏷</span>;
    default:
      return null;
  }
}

export const MyActivityItem = memo(function MyActivityItem({
  activity: a,
}: {
  activity: MyActivity;
}) {
  return (
    <li className="flex items-start gap-2.5 py-2.5 border-b border-secondary last:border-b-0 hover:bg-muted transition-colors -mx-4 px-4">
      <div className="size-6 shrink-0 flex items-center justify-center text-muted-foreground">
        <ActivityIcon type={a.type} />
      </div>
      <div className="flex-1 min-w-0 text-[12px]">
        <span>
          <ActivityText a={a} />
          {" in "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => open(a.repoUrl)}
          >
            {a.repo}
          </span>
        </span>
        <span className="text-muted-foreground"> · {timeAgo(a.createdAt)}</span>
      </div>
    </li>
  );
});
