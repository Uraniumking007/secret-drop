import {
  createFileRoute,
  Link,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Building2, Users, Layers, Plus } from "lucide-react";
import { useState } from "react";
import { createOrg, getUserOrgs } from "@/server/org/org";
import { toast } from "sonner";

export const Route = createFileRoute("/orgs/")({
  component: OrgsHub,
  loader: async () => {
    const { organizations } = await getUserOrgs();
    // console.log("organizations loader", organizations);

    return { organizations };
  },
});

function OrgsHub() {
  const navigate = useNavigate();
  const { organizations } = useLoaderData({
    from: "/orgs/",
  });
  const [showCreate, setShowCreate] = useState(false);

  const handleOrgSelect = (orgId: string) => {
    navigate({ to: `/orgs/${orgId}`, search: { tab: "general" } });
  };

  return (
    <DashboardLayout organizations={organizations.map((org) => org)}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Organization
          </button>
        </div>

        {/* List or Empty State */}
        {organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-xl bg-card/40">
            <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/40 border border-border">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">
              Create an organization to collaborate with your team
            </h2>
            <p className="mt-1 max-w-md text-muted-foreground">
              Share secrets, manage access, and onboard new members in a single,
              secure workspace.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New Organization
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/40 p-4"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">
                    {org.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    Your role: {org.role}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {org.userCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {org.teamCount}
                    </span>
                  </div>
                </div>
                <Link
                  to="/orgs/$orgId"
                  params={{ orgId: org.id }}
                  search={{ tab: "general" }}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-accent/40"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreate ? (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="font-medium">Create Organization</div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="h-8 w-8 inline-grid place-items-center rounded-md hover:bg-accent/40"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const name = String(fd.get("name") || "").trim();
                  if (!name) return;
                  setShowCreate(false);
                  const newId = await createOrg({ data: fd });
                  if (newId.success) {
                    navigate({
                      to: "/orgs/$orgId",
                      params: { orgId: newId.id },
                      search: { tab: "members" },
                    });
                    toast.success(
                      `Organization '${name}' created successfully. Now, invite your team!`
                    );
                  }
                }}
                className="p-4 space-y-3"
              >
                <div>
                  <label className="block text-sm mb-1">
                    Organization Name
                  </label>
                  <input
                    name="name"
                    autoFocus
                    className="w-full h-10 rounded-lg border border-border bg-background px-3"
                    placeholder="e.g., Acme Inc."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This will be the name of your shared workspace. You can
                    change this later.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="h-9 rounded-md border border-border px-3 hover:bg-accent/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
