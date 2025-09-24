import type { ReactNode } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

type NavbarProps = {
  variant?: "public" | "app";
  viewTitle?: string;
};

export function Navbar({ variant = "public", viewTitle }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const isAuthed = useMemo(() => !!session?.user?.email, [session]);
  const isApp = variant === "app" && isAuthed;

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm hover:bg-accent/30">
                  <Avatar>
                    <AvatarImage src={undefined} alt="avatar" />
                    <AvatarFallback>
                      {(session?.user?.email?.[0] || "?")?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block max-w-[160px] truncate text-muted-foreground">
                    {session?.user?.email ?? "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  {session?.user?.email ?? "Signed out"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings">Account Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/billing">Billing</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/logout"
                    className="inline-flex w-full items-center gap-2"
                  >
                    <span aria-hidden>⎋</span>
                    Log Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-accent/30">
                  <Avatar>
                    <AvatarImage src={undefined} alt="avatar" />
                    <AvatarFallback>
                      {(session?.user?.email?.[0] || "?")?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  {session?.user?.email ?? "Signed out"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings">Account Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/billing">Billing</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/logout"
                    className="inline-flex w-full items-center gap-2"
                  >
                    <span aria-hidden>⎋</span>
                    Log Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

export function HomeLayout({
  children,
  variant,
  viewTitle,
}: {
  children: ReactNode;
  variant?: "public" | "app";
  viewTitle?: string;
}) {
  return (
    <div>
      <Navbar variant={variant} viewTitle={viewTitle} />
      <div className="pt-16">{children}</div>
    </div>
  );
}
