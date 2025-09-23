import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        await authClient.signOut?.();
      } catch (e) {
        // silent
      }
      const t = setTimeout(() => {
        window.location.href = "/";
      }, 4000);
      return () => clearTimeout(t);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <div className="w-full max-w-[560px] text-center">
        <HeaderLogo center />

        <div className="mt-10 space-y-4">
          <div className="grid place-items-center">
            <ShieldCheckIcon />
          </div>
          <h2 className="m-0 text-xl font-semibold">
            You have been securely logged out.
          </h2>
          <p className="m-0 text-sm text-muted-foreground">
            Your session has ended. We look forward to seeing you again.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-primary/60 px-4 h-11 text-sm font-medium hover:bg-primary/10"
            >
              Return to Homepage
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Redirecting in 4 seconds…
          </p>
        </div>

        <FooterLinks />
      </div>
    </main>
  );
}

function HeaderLogo({ center }: { center?: boolean }) {
  return (
    <div className={center ? "mx-auto" : ""}>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-grid h-8 w-8 place-items-center rounded-md border border-border">
          <span aria-hidden>🛡️</span>
        </span>
        <span className="font-semibold tracking-tight text-foreground">
          Secretdrop
        </span>
      </span>
    </div>
  );
}

function FooterLinks() {
  return (
    <footer className="mx-auto mt-10 flex items-center justify-center gap-4 text-xs text-muted-foreground">
      <a href="/terms" className="hover:underline">
        Terms of Service
      </a>
      <span>•</span>
      <a href="/privacy" className="hover:underline">
        Privacy Policy
      </a>
      <span>•</span>
      <a href="/help" className="hover:underline">
        Help
      </a>
    </footer>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z"
        stroke="currentColor"
        strokeOpacity="0.5"
        fill="none"
      />
      <path
        d="M8.5 12.5l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
