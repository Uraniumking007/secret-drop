import type { ReactNode } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "../../lib/auth-client";

type NavbarProps = {
  variant?: "public" | "app";
  viewTitle?: string;
};

export function Navbar({ variant = "public", viewTitle }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const { data: session, isPending, error } = authClient.useSession();
  // console.log(session.refetch());

  useEffect(() => {
    if (isPending) {
      return;
    }
    console.log("session", session);
    if (session) {
      return;
    }
    console.log("data", data);
    if (data) {
      return;
    }
    console.log("error", error);
    if (error) {
      return;
    }

    setData(session);
  }, [session, isPending, data, error]);

  console.log("session", session);

  const isAuthed = useMemo(() => !!session?.user?.email, [session]);
  const isApp = variant === "app" || isAuthed;

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            to="/"
            aria-label="Secretdrop home"
            className="inline-flex items-center gap-2"
          >
            <span className="inline-grid h-8 w-8 place-items-center rounded-md border border-border">
              <span aria-hidden>🛡️</span>
            </span>
            <span className="font-semibold tracking-tight">Secretdrop</span>
          </Link>

          {!isApp ? (
            <nav className="ml-6 hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/pricing" className="hover:text-primary">
                Pricing
              </a>
              <a href="/features" className="hover:text-primary">
                Features
              </a>
              <a href="/docs" className="hover:text-primary">
                Docs
              </a>
            </nav>
          ) : (
            <div className="ml-4 hidden md:block truncate text-sm text-muted-foreground">
              {viewTitle}
            </div>
          )}
        </div>

        {!isApp ? (
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm hover:bg-primary/5"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-10 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <button
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((s) => !s)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm hover:bg-accent/30"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-foreground">
                {session?.user?.email
                  ? session?.user?.email[0]?.toUpperCase()
                  : "?"}
              </span>
              <span className="hidden sm:block max-w-[160px] truncate text-muted-foreground">
                {session?.user?.email ?? "Account"}
              </span>
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-4 top-16 w-64 rounded-md border border-border bg-card shadow-lg"
              >
                <div
                  className="px-3 py-2 text-xs text-muted-foreground"
                  aria-disabled
                >
                  {session?.user?.email ?? "Signed out"}
                </div>
                <div className="h-px bg-border/60" />
                <a
                  href="/settings"
                  className="block px-3 py-2 text-sm hover:bg-primary/10"
                  role="menuitem"
                >
                  Account Settings
                </a>
                <a
                  href="/billing"
                  className="block px-3 py-2 text-sm hover:bg-primary/10"
                  role="menuitem"
                >
                  Billing
                </a>
                <div className="h-px bg-border/60" />
                <Link
                  to="/logout"
                  className="block px-3 py-2 text-sm hover:bg-primary/10"
                  role="menuitem"
                >
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>⎋</span>
                    Log Out
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        )}

        <div className="md:hidden ml-2 flex items-center gap-2">
          {isApp ? (
            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-grid h-10 w-10 place-items-center rounded-md border border-border hover:bg-accent/30"
            >
              <span aria-hidden>☰</span>
            </button>
          ) : null}
          {isApp ? (
            <button
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((s) => !s)}
              className="inline-grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-accent/30"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-foreground">
                {session?.user?.email
                  ? session?.user?.email[0]?.toUpperCase()
                  : "?"}
              </span>
            </button>
          ) : (
            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-grid h-10 w-10 place-items-center rounded-md border border-border hover:bg-accent/30"
            >
              <span aria-hidden>☰</span>
            </button>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="md:hidden border-t border-border bg-card">
          {!isApp ? (
            <div className="px-4 py-3">
              <nav className="flex flex-col gap-1 text-sm">
                <a
                  href="/pricing"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  Pricing
                </a>
                <a
                  href="/features"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  Features
                </a>
                <a
                  href="/docs"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  Docs
                </a>
                <div className="my-2 h-px bg-border" />
                <Link
                  to="/login"
                  className="rounded-md border border-border px-2 py-2 text-center"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="mt-2 rounded-md bg-primary px-2 py-2 text-center font-semibold text-primary-foreground"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          ) : (
            <div className="px-4 py-3">
              <nav className="flex flex-col gap-1 text-sm">
                <a
                  href="/"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  Dashboard
                </a>
                <a
                  href="/secrets"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  My Secrets
                </a>
                <a
                  href="/teams"
                  className="rounded-md px-2 py-2 hover:bg-primary/10"
                >
                  Teams
                </a>
              </nav>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="pt-16">{children}</div>
    </div>
  );
}
