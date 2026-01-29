import { useState, useEffect, useCallback, useRef } from "react";

export function useLazyList<T>(items: T[], initialCount: number, batchSize: number) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const prevRef = useRef(items);

  useEffect(() => {
    if (prevRef.current !== items) {
      setVisibleCount(initialCount);
      prevRef.current = items;
    }
  }, [items, initialCount]);

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + batchSize, items.length));
  }, [batchSize, items.length]);

  return { visible, hasMore, loadMore, total: items.length };
}
