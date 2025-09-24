import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/2fa")({
  component: TwoFAPage,
});

function TwoFAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasChallenge = params.get("challenge") === "1";
  let hasLocal = false;
  try {
    const raw = localStorage.getItem("twofa-challenge");
    if (raw) {
      const parsed = JSON.parse(raw) as { ts: number };
      if (parsed?.ts && Date.now() - parsed.ts < 2 * 60 * 1000) {
        // 2 minutes freshness window
        hasLocal = true;
      }
    }
  } catch {}

  // Require a fresh 2FA challenge marker; otherwise redirect to login
  if (!hasChallenge || !hasLocal) {
    navigate({ to: "/login" });
    return null;
  }
  const [code, setCode] = useState("");
  const [isBackup, setIsBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let trust = true;
      try {
        const raw = localStorage.getItem("twofa-remember-device");
        if (raw) {
          const parsed = JSON.parse(raw) as { remember?: boolean; ts?: number };
          trust = !!parsed?.remember;
        }
      } catch {}
      const res = isBackup
        ? await authClient.twoFactor.verifyBackupCode({
            code,
            trustDevice: trust,
          })
        : await authClient.twoFactor.verifyTotp({
            code,
            trustDevice: trust,
          });
      if (res.error) throw new Error(res.error.message || "Invalid code");
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-5">
        <h1 className="m-0 text-lg font-semibold">Two-Factor Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
          {isBackup ? " (backup code)" : ""}.
        </p>
        <form onSubmit={onVerify} className="mt-4 space-y-3">
          <input
            autoFocus
            inputMode="numeric"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder={isBackup ? "Backup code" : "123 456"}
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
          />
          {error ? <div className="text-sm text-red-500">{error}</div> : null}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsBackup((v) => !v)}
              className="text-xs text-muted-foreground hover:underline"
            >
              {isBackup ? "Use authenticator code" : "Use a backup code"}
            </button>
            <div className="flex gap-2">
              <a
                href="/"
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
