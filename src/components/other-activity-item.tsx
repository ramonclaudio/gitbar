import { memo } from "react";
import { open } from "@tauri-apps/plugin-shell";
import type { Activity } from "@/hooks/github/types";
import { timeAgo } from "@/lib/time";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarIcon, ForkIcon } from "@/components/icons";

export const OtherActivityItem = memo(function OtherActivityItem({
  activity: a,
}: {
  activity: Activity;
}) {
  return (
    <li className="flex items-start gap-2.5 py-2.5 border-b border-secondary last:border-b-0 hover:bg-muted transition-colors -mx-4 px-4">
      <Avatar className="size-6 shrink-0 cursor-pointer" onClick={() => open(a.actorUrl)}>
        <AvatarImage src={a.actorAvatar} />
        <AvatarFallback>{a.actor[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 text-[12px]">
        <span>
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => open(a.actorUrl)}
          >
            {a.actor}
          </span>
          {a.type === "star" ? " starred " : " forked "}
          <span
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => open(a.repoUrl)}
          >
            {a.repo}
          </span>
          {a.type === "fork" && a.forkName && (
            <span className="text-muted-foreground">
              {" "}
              →{" "}
              <span className="cursor-pointer hover:text-primary" onClick={() => open(a.forkUrl!)}>
                {a.forkName}
              </span>
            </span>
          )}
        </span>
        <span className="text-muted-foreground"> · {timeAgo(a.createdAt)}</span>
      </div>
      {a.type === "star" ? (
        <StarIcon className="shrink-0 mt-1" />
      ) : (
        <ForkIcon className="shrink-0 mt-0.5" />
      )}
    </li>
  );
});
