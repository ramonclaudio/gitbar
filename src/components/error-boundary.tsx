import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="h-screen flex flex-col items-center justify-center gap-4 bg-background backdrop-blur-xl rounded-xl overflow-hidden">
          <p className="text-sm text-destructive font-medium">Something went wrong</p>
          <p className="text-xs text-muted-foreground max-w-xs text-center">
            {this.state.error.message}
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </main>
      );
    }
    return this.props.children;
  }
}
