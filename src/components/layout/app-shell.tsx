import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas-white">
      <Sidebar />
      <TopBar title={title} />
      <main className="md:ml-[240px] pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
