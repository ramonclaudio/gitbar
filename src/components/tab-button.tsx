import { memo } from "react";
import { cn } from "@/lib/utils";

export const TabButton = memo(function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
        active
          ? "bg-accent text-primary font-semibold"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-[11px] px-1.5 rounded-full min-w-[18px] text-center",
            active ? "bg-accent text-primary" : "bg-border",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
});
