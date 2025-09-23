import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionCard } from "./SectionCard";

export function ProfilePane({ email }: { email: string }) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [value, setValue] = useState(email);
  const [dirty, setDirty] = useState(false);

  function onSave() {
    setEditingEmail(false);
    setDirty(false);
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Profile Settings"
        footer={
          <div className="flex justify-end">
            <button
              disabled={!dirty}
              onClick={onSave}
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={undefined} alt="avatar" />
            <AvatarFallback>
              {(email?.[0] || "?")?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-muted-foreground">
            Initials generated from your email
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs text-muted-foreground">
                Email address
              </label>
              {editingEmail ? (
                <input
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setDirty(true);
                  }}
                  className="mt-1 w-[min(420px,100%)] h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  type="email"
                  placeholder="you@example.com"
                />
              ) : (
                <div className="mt-1 text-sm">{email || "you@example.com"}</div>
              )}
            </div>
            <div>
              {editingEmail ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEmail(false);
                      setValue(email);
                      setDirty(false);
                    }}
                    className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={!dirty}
                    className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingEmail(true)}
                  className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm hover:bg-primary/10"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
