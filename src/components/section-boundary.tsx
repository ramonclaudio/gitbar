import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  error: Error | null;
}

export class SectionBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
          {this.props.name} failed to load
        </div>
      );
    }
    return this.props.children;
  }
}
