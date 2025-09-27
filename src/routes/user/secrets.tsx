import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { getUserOrgs } from "@/server/org/org";
import { getUserSecrets } from "@/server/user/secrets";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/user/secrets")({
  component: RouteComponent,
  loader: async () => {
    const { organizations } = await getUserOrgs();
    const { secrets } = await getUserSecrets();
    return { secrets, organizations };
  },
});

function RouteComponent() {
  const { secrets, organizations } = useLoaderData({
    from: "/user/secrets",
  });
  return (
    <DashboardLayout organizations={organizations.map((org) => org)}>
      <PersonalDashboard secrets={secrets} />
    </DashboardLayout>
  );
}
