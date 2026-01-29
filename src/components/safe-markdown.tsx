import { Component, type ReactNode, type AnchorHTMLAttributes } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { open } from "@tauri-apps/plugin-shell";

function ExternalLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (href) open(href);
      }}
    >
      {children}
    </a>
  );
}

const components = { a: ExternalLink };

function linkReferences(text: string, repo?: string): string {
  let result = text.replace(
    /(?<![/\w])@([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/g,
    "[@$1](https://github.com/$1)",
  );

  // Cross-repo refs: owner/repo#123 (self-contained, no context needed)
  result = result.replace(
    /(?<![/\w])([a-zA-Z0-9\-]+\/[a-zA-Z0-9._\-]+)#(\d+)/g,
    "[$1#$2](https://github.com/$1/issues/$2)",
  );

  // Local refs: #123 (needs repo context)
  if (repo) {
    result = result.replace(
      /(?<![&/\w])(?<!`)#(\d+)(?![\w;])/g,
      `[#$1](https://github.com/${repo}/issues/$1)`,
    );
  }

  return result;
}

interface Props {
  children: string;
  className?: string;
  repo?: string;
}

interface State {
  hasError: boolean;
}

export class SafeMarkdown extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <p className="text-sm text-muted-foreground italic">Failed to render markdown</p>;
    }
    return (
      <div className={this.props.className}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={components}
        >
          {linkReferences(this.props.children, this.props.repo)}
        </Markdown>
      </div>
    );
  }
}
