import { X } from "lucide-react";

export interface SecretDetailMeta {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  expiresAt?: string | null;
  isExpiring: boolean;
  variablesHint?: string;
  isPublic: boolean;
  variablesPassword?: string;
  variables?: string;
}

export interface SecretViewItem {
  id: string;
  userName: string | null; // null => Anonymous
  ipAddress: string | null;
  userAgent: string | null;
  viewedAt: string; // ISO
}

interface DetailPaneProps {
  open: boolean;
  secret?: SecretDetailMeta | null;
  views?: SecretViewItem[];
  onClose: () => void;
}

export function DetailPane({
  open,
  secret,
  views = [],
  onClose,
}: DetailPaneProps) {
  if (!open || !secret) return null;

  return (
    <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] lg:w-[520px] border-l border-border bg-card z-40 shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground truncate">
          {secret.name}
        </h3>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="h-[calc(100%-57px)] overflow-y-auto">
        {/* Metadata */}
        <section className="px-5 py-4 border-b border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Metadata</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <KeyValue label="Description" value={secret.description || "—"} />
            <KeyValue
              label="Created"
              value={formatDateTime(secret.createdAt)}
            />
            <KeyValue
              label="Expires"
              value={secret.expiresAt ? formatDateTime(secret.expiresAt) : "—"}
            />
            <KeyValue
              label="Password Protected"
              value={secret.variablesPassword ? "Yes" : "No"}
            />
          </div>
        </section>

        {/* Activity Log */}
        <section className="px-5 py-4">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Recent Views
          </h4>
          <div className="space-y-3">
            {views.length === 0 ? (
              <p className="text-sm text-muted-foreground">No views yet.</p>
            ) : (
              views
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.viewedAt).getTime() -
                    new Date(a.viewedAt).getTime()
                )
                .map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border border-border bg-card/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {v.userName || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.ipAddress || "—"} · {v.userAgent || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {fromNow(v.viewedAt)}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-foreground break-words">{value}</div>
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function fromNow(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
