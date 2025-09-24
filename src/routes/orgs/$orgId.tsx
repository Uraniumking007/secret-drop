import {
  createFileRoute,
  Link,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/orgs/$orgId")({
  component: OrgSettings,
});

const TABS = ["general", "members", "teams", "billing", "danger"] as const;
type Tab = (typeof TABS)[number];

function OrgSettings() {
  const { orgId } = useParams({ from: "/orgs/$orgId" });
  const search = useSearch({ from: "/orgs/$orgId" }) as { tab?: Tab };
  const [active, setActive] = useState<Tab>(search.tab ?? "general");

  const org = useMemo(() => ({ id: orgId, name: "Acme Inc." }), [orgId]);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-1 text-sm text-muted-foreground">
            <Link to="/orgs" className="hover:text-foreground">
              Organizations
            </Link>
            <span className="mx-1">/</span>
            <span>{org.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{org.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          {/* Vertical Tabs */}
          <div className="rounded-xl border border-border bg-card/40 p-2 h-fit">
            <TabLink
              label="General"
              tab="general"
              active={active}
              onClick={setActive}
            />
            <TabLink
              label="Members"
              tab="members"
              active={active}
              onClick={setActive}
            />
            <TabLink
              label="Teams"
              tab="teams"
              active={active}
              onClick={setActive}
            />
            <TabLink
              label="Billing"
              tab="billing"
              active={active}
              onClick={setActive}
            />
            <div className="my-2 h-px bg-border" />
            <TabLink
              label="Danger Zone"
              tab="danger"
              active={active}
              onClick={setActive}
              danger
            />
          </div>

          {/* Content Pane */}
          <div className="rounded-xl border border-border bg-card/40 p-5 min-h-[360px]">
            {active === "general" && <GeneralPane orgName={org.name} />}
            {active === "members" && <MembersPane />}
            {active === "teams" && <TeamsPane />}
            {active === "billing" && <BillingPane />}
            {active === "danger" && <DangerPane orgName={org.name} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TabLink({
  label,
  tab,
  active,
  onClick,
  danger,
}: {
  label: string;
  tab: Tab;
  active: Tab;
  onClick: (t: Tab) => void;
  danger?: boolean;
}) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
        isActive
          ? "bg-primary/10 border-primary/30 text-foreground"
          : danger
            ? "border-border text-red-400/90 hover:bg-red-500/10"
            : "border-transparent hover:bg-accent/40"
      }`}
    >
      {label}
    </button>
  );
}

function GeneralPane({ orgName }: { orgName: string }) {
  const [name, setName] = useState(orgName);
  const [dirty, setDirty] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Organization Name
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(e.target.value !== orgName);
          }}
          className="w-full h-10 px-3 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        disabled={!dirty}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
      >
        Save Changes
      </button>
    </div>
  );
}

function MembersPane() {
  const [showInvite, setShowInvite] = useState(false);
  const members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }> = [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Members</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {/* Members table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No members yet.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{m.email}</td>
                  <td className="px-3 py-2">
                    <select className="h-9 rounded-md border border-border bg-background px-2 text-sm">
                      <option>Owner</option>
                      <option>Admin</option>
                      <option>Member</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="h-9 rounded-md border border-border px-3 hover:bg-accent/40">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {showInvite ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowInvite(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="font-medium">Invite Member</div>
              <button
                onClick={() => setShowInvite(false)}
                className="h-8 w-8 inline-grid place-items-center rounded-md hover:bg-accent/40"
              >
                ×
              </button>
            </div>
            <form className="p-4 space-y-3">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full h-10 rounded-lg border border-border bg-background px-3"
                  placeholder="dev@company.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select className="w-full h-10 rounded-lg border border-border bg-background px-3">
                  <option>Admin</option>
                  <option>Member</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="h-9 rounded-md border border-border px-3 hover:bg-accent/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TeamsPane() {
  const teams: Array<{ id: string; name: string; members: number }> = [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Teams</h2>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>
      <div className="grid gap-3">
        {teams.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No teams yet.
          </div>
        ) : (
          teams.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-4"
            >
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.members} members
                </div>
              </div>
              <button className="h-9 rounded-md border border-border px-3 hover:bg-accent/40">
                Manage
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BillingPane() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card/40 p-4">
        <div className="font-medium">Current Plan</div>
        <div className="text-sm text-muted-foreground">Free</div>
      </div>
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="font-semibold mb-1">Upgrade for advanced features</div>
        <p className="text-sm text-muted-foreground">
          Get audit exports, SSO, and more.
        </p>
        <button className="mt-3 h-10 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
          View Plans
        </button>
      </div>
    </div>
  );
}

function DangerPane({ orgName }: { orgName: string }) {
  const [confirm, setConfirm] = useState("");
  const disabled = confirm !== orgName;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5">
        <div className="font-semibold text-red-400">Delete Organization</div>
        <p className="mt-1 text-sm text-red-300/90">
          This action is permanent and cannot be undone. All secrets, teams, and
          member associations for this organization will be permanently erased.
        </p>
        <div className="mt-3">
          <label className="block text-sm mb-1">
            Type the organization name to confirm
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-background px-3"
            placeholder={orgName}
          />
        </div>
        <div className="mt-4 flex items-center justify-end">
          <button
            disabled={disabled}
            className="h-10 rounded-lg border border-red-500/50 px-4 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete this Organization...
          </button>
        </div>
      </div>
    </div>
  );
}
