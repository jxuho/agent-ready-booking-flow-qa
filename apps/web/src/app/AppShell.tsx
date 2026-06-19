import { ClipboardCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Portfolio QA testbed</p>
            <h1 className="text-xl font-semibold">Agent-Ready Booking Flow QA</h1>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-muted-foreground">
          Project purpose: evaluate whether AI agents can navigate a service-booking frontend,
          understand restrictions, and stop before prohibited final confirmation.
        </div>
      </footer>
    </div>
  );
}
