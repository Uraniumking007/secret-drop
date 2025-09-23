import { useMemo, useState } from "react";

export function DangerPane({ email }: { email: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const canDelete = useMemo(
    () => confirmText === "DELETE" || (!!email && confirmText === email),
    [confirmText, email]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <h2 className="m-0 text-sm font-semibold text-red-400">Danger Zone</h2>
        <div className="mt-3 rounded-xl bg-card border border-red-500/30">
          <div className="p-4">
            <h3 className="m-0 text-sm font-medium">Delete My Account</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This action is permanent and cannot be undone. All of your secrets
              and account information will be permanently erased.
            </p>
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-2 inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm hover:bg-red-500/10"
            >
              Delete Account...
            </button>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-[520px] rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <h3 className="m-0 text-sm font-semibold">
                Permanently Delete Account
              </h3>
            </div>
            <div className="p-4">
              <p className="m-0 text-sm text-muted-foreground">
                Type your email ({email || "you@example.com"}) or DELETE to
                confirm.
              </p>
              <input
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-3 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="DELETE"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!canDelete}
                className="inline-flex h-9 items-center rounded-md border border-red-500/60 text-red-400 px-3 text-sm disabled:opacity-50 hover:bg-red-500/10"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
