import type { ReactNode } from "react";
import {
  ContextSidebar,
  type Organization,
} from "@/components/dashboard/ContextSidebar";
import { useState } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [contextType, setContextType] = useState<"personal" | "organization">(
    "personal"
  );
  const [contextId, setContextId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const organizations: Organization[] = [
    { id: "org_1", name: "Acme Inc." },
    { id: "org_2", name: "Globex" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] min-h-screen">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <ContextSidebar
            currentContextType={contextType}
            currentContextId={contextId}
            organizations={organizations}
            onChangeContext={({ type, id }) => {
              setContextType(type);
              setContextId(id);
            }}
          />
        </div>
        {/* Content */}
        <div className="px-4 md:px-6 py-4 md:py-6">
          {/* Mobile sidebar trigger */}
          <div className="mb-4 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40"
            >
              <span aria-hidden>☰</span>
              <span>Menu</span>
            </button>
          </div>
          {children}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] border-r border-border bg-card shadow-xl animate-in slide-in-from-left">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                Navigation
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent/40"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <ContextSidebar
              currentContextType={contextType}
              currentContextId={contextId}
              organizations={organizations}
              onChangeContext={({ type, id }) => {
                setContextType(type);
                setContextId(id);
                setMobileOpen(false);
              }}
              className="max-w-none"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
