import type { ReactNode } from 'react';

// Re-mounts on every navigation, which replays the page-enter animation.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
