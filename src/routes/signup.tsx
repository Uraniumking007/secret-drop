import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !!email && !!password && password === confirm && agree && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      // Attempt signup; adapt to your auth provider
      await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0] || email,
      });
      // Redirect to home after signup
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <div className="w-full max-w-[420px]">
        <HeaderLogo center clickable />

        <div className="mt-6 rounded-xl bg-card border border-border shadow-sm">
          <div className="p-6">
            <div className="mx-auto mb-4 grid place-items-center">
              <ShieldPlusIcon />
            </div>
            <h2 className="m-0 text-xl font-semibold text-foreground text-center">
              Create your secure account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Join Secretdrop and start sharing secrets securely.
            </p>

            {error ? (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            <form className="mt-5 space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted-foreground">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 grid place-items-center px-2 text-muted-foreground hover:text-foreground"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
                {confirm && confirm !== password ? (
                  <p className="mt-1 text-xs text-destructive">
                    Passwords do not match.
                  </p>
                ) : null}
              </div>

              <label className="mt-1 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <a className="text-primary hover:underline" href="/terms">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a className="text-primary hover:underline" href="/privacy">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 h-11 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-50 hover:bg-primary/90"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>

        <FooterLinks />
      </div>
    </main>
  );
}

function HeaderLogo({
  center,
  clickable,
}: {
  center?: boolean;
  clickable?: boolean;
}) {
  const Logo = (
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
  if (clickable) {
    return (
      <Link to="/" className={center ? "block" : undefined}>
        {Logo}
      </Link>
    );
  }
  return Logo;
}

function FooterLinks() {
  return (
    <footer className="mx-auto mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
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

function ShieldPlusIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" aria-hidden>
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
        d="M12 8v4m-2-2h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 6h16v12H4z" fill="currentColor" opacity="0.08" />
      <path
        d="M4 6h16v12H4z"
        stroke="currentColor"
        strokeOpacity="0.5"
        fill="none"
      />
      <path
        d="M4 8l8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
        stroke="currentColor"
        fill="none"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" />
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
        stroke="currentColor"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}
