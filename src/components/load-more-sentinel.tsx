import { useEffect, useRef } from "react";

function findScrollableAncestor(el: Element): Element | null {
  let current = el.parentElement;
  while (current) {
    const { overflow, overflowY } = getComputedStyle(current);
    if (
      overflow === "auto" ||
      overflow === "scroll" ||
      overflowY === "auto" ||
      overflowY === "scroll"
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function LoadMoreSentinel({
  onLoadMore,
  hasMore,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !ref.current) return;

    const el = ref.current;
    const root = findScrollableAncestor(el);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { root, rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!hasMore) return null;
  return <div ref={ref} className="h-px" />;
}
