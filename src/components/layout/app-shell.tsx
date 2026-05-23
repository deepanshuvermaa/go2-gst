import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[220px] pb-[80px] md:pb-0">
        <div className="max-w-[860px] mx-auto px-5 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
