export function EmptyState({ loading, message = "None" }: { loading: boolean; message?: string }) {
  return (
    <p className="text-xs text-muted-foreground py-4 text-center">
      {loading ? "Loading..." : message}
    </p>
  );
}
