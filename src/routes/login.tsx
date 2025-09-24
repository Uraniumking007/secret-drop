import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [show2fa, setShow2fa] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaIsBackup, setTwofaIsBackup] = useState(false);
  const navigate = useNavigate();
  const canSubmit = !!email && !!password && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      // Persist the preference for the 2FA step to pick up
      try {
        localStorage.setItem(
          "twofa-remember-device",
          JSON.stringify({ remember: rememberDevice, ts: Date.now() })
        );
      } catch {}
      const resp = await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          async onSuccess(ctx) {
            if ((ctx.data as any)?.twoFactorRedirect) {
              setShow2fa(true);
              return;
            }
            navigate({ to: "/" });
          },
        }
      );
      // Fallback in case onSuccess isn't invoked by the client
      if ((resp as any)?.data?.twoFactorRedirect) {
        setShow2fa(true);
        return;
      }
    } catch (err: any) {
      setError("Email or password is incorrect.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const trust = !!rememberDevice;
      const res = twofaIsBackup
        ? await authClient.twoFactor.verifyBackupCode({
            code: twofaCode,
            trustDevice: trust,
          })
        : await authClient.twoFactor.verifyTotp({
            code: twofaCode,
            trustDevice: trust,
          });
      if (res.error) throw new Error(res.error.message || "Invalid code");
      setShow2fa(false);
      setTwofaCode("");
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message ?? "Verification failed");
    }
  }

  return (
    <>
      <main className="min-h-screen bg-background text-foreground grid place-items-center px-4">
        <div className="w-full max-w-[400px]">
          <HeaderLogo center clickable />

          <div className="mt-6 rounded-xl bg-card border border-border shadow-sm">
            <div className="p-6">
              <div className="mx-auto mb-4 grid place-items-center">
                <ShieldKeyholeIcon />
              </div>
              <h2 className="m-0 text-xl font-semibold text-foreground text-center">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-center">
                Log in to your Secretdrop account.
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

                <div className="flex justify-end text-sm">
                  <label className="mr-auto inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                    />
                    <span>Remember this device</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 h-11 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-50 hover:bg-primary/90"
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>

          <FooterLinks />
        </div>
      </main>

      {show2fa ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-background p-5 shadow-lg">
            <h3 className="m-0 text-lg font-semibold">
              Two-Factor Verification
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app
              {twofaIsBackup ? " (backup code)" : ""}.
            </p>
            <form className="mt-4 space-y-3" onSubmit={onVerify2FA}>
              <input
                autoFocus
                inputMode="numeric"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={twofaIsBackup ? "Backup code" : "123 456"}
                value={twofaCode}
                onChange={(e) => setTwofaCode(e.target.value.trim())}
              />
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTwofaIsBackup((v) => !v)}
                  className="text-muted-foreground hover:underline"
                >
                  {twofaIsBackup
                    ? "Use authenticator code"
                    : "Use a backup code"}
                </button>
              </div>
              {error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShow2fa(false)}
                  className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twofaCode.length < 6}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
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

function ShieldKeyholeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden>
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
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 10v4" stroke="#000" strokeOpacity="0.4" />
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
