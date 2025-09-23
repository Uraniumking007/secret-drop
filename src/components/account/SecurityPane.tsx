import { useEffect, useState } from "react";
import { SectionCard } from "./SectionCard";
import { authClient } from "@/lib/auth-client";

type AuthSession = {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt?: string | Date | null;
};

export function SecurityPane({ email }: { email: string }) {
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState<AuthSession[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await authClient.listSessions?.();
        if (!isMounted) return;
        setSessions((data?.data ?? []) as AuthSession[]);
      } catch {
        if (!isMounted) return;
        setSessions([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [email]);
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
              className="inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm hover:bg-red-500/10"
              onClick={() => setTwoFAEnabled(false)}
            >
              Disable
            </button>
          ) : (
            <button
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => setShow2FA(true)}
            >
              Enable
            </button>
          )}
        </div>

        {show2FA ? (
          <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
            <div className="text-sm font-medium mb-2">
              Set up Two-Factor Authentication
            </div>
            <div className="grid gap-3 sm:grid-cols-[200px_1fr] items-start">
              <div className="grid place-items-center rounded-md border border-border bg-card p-4 text-muted-foreground">
                QR CODE
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Scan with an authenticator app, or enter this key manually:
                </div>
                <div className="mt-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                  ABCD-EFGH-IJKL-MNOP
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-sm">
                    Enter first code to verify
                  </label>
                  <input
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="123 456"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
                    onClick={() => setShow2FA(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setTwoFAEnabled(true);
                      setShow2FA(false);
                    }}
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
          <div className="flex justify-end">
            <button className="inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm hover:bg-red-500/10">
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
              label={session.userAgent ?? "Unknown device"}
              ip={session.ipAddress ?? "Unknown IP"}
              last={
                session.expiresAt
                  ? new Date(session.expiresAt).toLocaleString()
                  : "Unknown"
              }
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function SessionRow({
  label,
  ip,
  last,
  current,
}: {
  label: string;
  ip: string;
  last: string;
  current?: boolean;
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
        <button className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs hover:bg-primary/10">
          Log Out
        </button>
      )}
    </div>
  );
}
