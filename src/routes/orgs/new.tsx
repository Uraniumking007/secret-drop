import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const Route = createFileRoute("/orgs/new")({
  component: CreateOrg,
});

function CreateOrg() {
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    if (!name) return;
    // TODO: create org via API and get id
    const newId = Math.random().toString(36).slice(2);
    // Redirect to Members tab
    navigate({ to: `/orgs/${newId}?tab=members`, search: { tab: "members" } });
    // TODO: success toast "Organization '[Org Name]' created successfully. Now, invite your team!"
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Breadcrumbs */}
        <div className="mb-2 text-sm text-muted-foreground">
          <Link to="/orgs" className="hover:text-foreground">
            Organizations
          </Link>
          <span className="mx-1">/</span>
          <span>Create New</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">Create a New Organization</h1>

        <div className="max-w-xl">
          <div className="rounded-xl border border-border bg-card/40 p-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g., Acme Inc."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This will be the name of your shared workspace. You can change
                  this later.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Create Organization
                </button>
                <Link
                  to="/orgs"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
