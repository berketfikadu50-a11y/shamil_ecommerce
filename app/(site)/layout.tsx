import type { ReactNode } from 'react';
import { Header, TabBar } from '@/components/shell';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-28 md:pb-16">{children}</main>
      <TabBar />
    </>
  );
}
