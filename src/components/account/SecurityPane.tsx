import { useEffect, useState } from "react";
import { SectionCard } from "./SectionCard";
import { authClient } from "@/lib/auth-client";
import QRCode from "react-qr-code";

const SESSIONS_TTL_MS = 60_000; // 60s

function loadCachedSessions(cacheKey: string) {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: any[] };
    if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.data))
      return null;
    if (Date.now() - parsed.ts > SESSIONS_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCachedSessions(cacheKey: string, data: any[]) {
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

type AuthSession = {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt?: string | Date | null;
};

export function SecurityPane({ email }: { email: string }) {
  const { data: sessionData } = authClient.useSession();
  const [show2FA, setShow2FA] = useState(false);
  // reflect server truth
  const twoFAEnabled = !!sessionData?.user?.twoFactorEnabled;
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(false);

  const cacheKey = `sessions:${email || "anon"}`;

  async function fetchSessions(force = false) {
    if (!force) {
      const cached = loadCachedSessions(cacheKey);
      if (cached) {
        setSessions(cached as AuthSession[]);
      }
    }
    setLoading(true);
    try {
      const data = await authClient.listSessions?.();
      const list = (data?.data ?? []) as AuthSession[];
      setSessions(list);
      saveCachedSessions(cacheKey, list);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }

  async function enable2FA() {
    setIsBusy(true);
    setError(null);
    try {
      // Check if user has a valid session first
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        throw new Error("Please log in again to enable 2FA");
      }

      console.log("Enabling 2FA for user:", session.data.user?.email);
      const res = await authClient.twoFactor.enable({
        password,
        issuer: "Secret Drop",
      });
      console.log("2FA enable response:", res);
      if (res.error)
        throw new Error(res.error.message || "Failed to enable 2FA");

      // Use the URI returned from enable
      setTotpURI(res.data?.totpURI ?? null);
      setBackupCodes(res.data?.backupCodes ?? null);
      setShow2FA(true);
    } catch (e: any) {
      console.error("2FA enable error:", e);
      setError(e?.message ?? "Something went wrong");
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyTOTP() {
    setIsBusy(true);
    setError(null);
    try {
      // Check session before verification
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        throw new Error("Please log in again to verify 2FA");
      }

      console.log("Verifying TOTP code:", verifyCode);
      console.log("Current session:", session.data.session?.id);
      console.log("User ID:", session.data.user?.id);
      console.log("User 2FA enabled:", session.data.user?.twoFactorEnabled);

      // Try verification with a fresh session check
      const freshSession = await authClient.getSession();
      console.log(
        "Fresh session before verification:",
        freshSession.data?.session?.id
      );

      const res = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
        trustDevice: true,
      });
      console.log("TOTP verification response:", res);
      if (res.error) {
        console.error("TOTP verification error:", res.error);
        // More specific error handling
        if (res.error.message?.includes("invalid two factor")) {
          throw new Error(
            "Invalid TOTP code. Please check your authenticator app and try again."
          );
        }
        throw new Error(res.error.message || "Invalid code");
      }
      setShow2FA(false);
      setVerifyCode("");
      // refresh session to reflect twoFactorEnabled
      try {
        await authClient.getSession();
      } catch {}
    } catch (e: any) {
      console.error("TOTP verification exception:", e);
      setError(e?.message ?? "Verification failed");
    } finally {
      setIsBusy(false);
    }
  }

  async function disable2FA() {
    setIsBusy(true);
    setError(null);
    try {
      const res = await authClient.twoFactor.disable({ password });
      if (res.error)
        throw new Error(res.error.message || "Failed to disable 2FA");
      setTotpURI(null);
      setBackupCodes(null);
      // refresh session to reflect twoFactorEnabled
      try {
        await authClient.getSession();
      } catch {}
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const cached = loadCachedSessions(cacheKey);
      if (cached && isMounted) {
        setSessions(cached as AuthSession[]);
      }
      await fetchSessions(!cached);
    })();
    return () => {
      isMounted = false;
    };
  }, [cacheKey]);
  return (
    <div className="space-y-4">
      <SectionCard
        title="Change Password"
        footer={
          <div className="flex justify-end">
            <button className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Update Password
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Current Password</label>
            <input
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              type="password"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">New Password</label>
            <input
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              type="password"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Confirm New Password</label>
            <input
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              type="password"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            Status:{" "}
            {twoFAEnabled ? (
              <span className="text-emerald-400">Enabled</span>
            ) : (
              <span className="text-muted-foreground">Disabled</span>
            )}
          </div>
          {twoFAEnabled ? (
            <button
              className="inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm hover:bg-red-500/10 disabled:opacity-50"
              onClick={disable2FA}
              disabled={isBusy}
            >
              Disable
            </button>
          ) : (
            <button
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={enable2FA}
              disabled={isBusy || !password}
            >
              Enable
            </button>
          )}
        </div>

        {error ? (
          <div className="mt-3 text-sm text-red-400">{error}</div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <div>
            <label className="mb-1 block text-sm">Account Password</label>
            <input
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {show2FA ? (
          <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
            <div className="text-sm font-medium mb-2">
              Set up Two-Factor Authentication
            </div>
            <div className="grid gap-3 sm:grid-cols-[240px_1fr] items-start">
              <div className="grid place-items-center rounded-md border border-border bg-white p-4">
                {totpURI ? (
                  <QRCode
                    value={totpURI}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                ) : (
                  <div className="text-muted-foreground">QR CODE</div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Scan with an authenticator app, or enter this key manually:
                </div>
                {totpURI && (
                  <div className="mt-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-mono break-all">
                    {totpURI}
                  </div>
                )}
                {backupCodes?.length ? (
                  <div className="mt-3">
                    <div className="text-sm mb-1">Backup Codes</div>
                    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs whitespace-pre-wrap">
                      {backupCodes.join("\n")}
                    </div>
                  </div>
                ) : null}
                <div className="mt-3">
                  <label className="mb-1 block text-sm">
                    Enter first code to verify
                  </label>
                  <input
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="123 456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm disabled:opacity-50"
                    onClick={() => setShow2FA(false)}
                    disabled={isBusy}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    onClick={verifyTOTP}
                    disabled={isBusy || verifyCode.length < 6}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Active Sessions"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => fetchSessions(true)}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm hover:bg-primary/10 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={async () => {
                await authClient.revokeOtherSessions();
                await fetchSessions(true);
              }}
              className="inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm hover:bg-red-500/10"
            >
              Log out of all other sessions
            </button>
          </div>
        }
      >
        <p className="m-0 text-sm text-muted-foreground">
          This is a list of devices that have logged into your account. Revoke
          any sessions you do not recognize.
        </p>
        <div className="mt-3 divide-y divide-border">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              id={session.id}
              label={session.userAgent ?? "Unknown device"}
              ip={session.ipAddress ?? "Unknown IP"}
              last={
                session.expiresAt
                  ? new Date(session.expiresAt).toLocaleString()
                  : "Unknown"
              }
              fetchSessions={fetchSessions}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function SessionRow({
  label,
  id,
  ip,
  last,
  current,
  fetchSessions,
}: {
  label: string;
  id: string;
  ip: string;
  last: string;
  current?: boolean;
  fetchSessions: (force: boolean) => Promise<void>;
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">
          {ip} • {last}
        </div>
      </div>
      {current ? (
        <span className="text-xs text-muted-foreground">Current</span>
      ) : (
        <button
          onClick={async () => {
            await authClient.revokeSession({ token: id });
            fetchSessions(true);
          }}
          className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs hover:bg-primary/10"
        >
          Log Out
        </button>
      )}
    </div>
  );
}
