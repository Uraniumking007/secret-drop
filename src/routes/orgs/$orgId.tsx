import {
  createFileRoute,
  Link,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Plus } from "lucide-react";
import { OrgTabs, ORG_TABS, type OrgTab } from "@/components/org/OrgTabs";
import {
  GeneralPane,
  MembersPane,
  TeamsPane,
  BillingPane,
  DangerPane,
} from "@/components/org/OrgPanes";
import { getOrgById } from "@/server/org/org";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/orgs/$orgId")({
  component: OrgSettings,
});

type Tab = OrgTab;

function OrgSettings() {
  const { orgId } = useParams({ from: "/orgs/$orgId" });
  const { data: orgData } = useQuery({
    queryKey: ["org", orgId],
    queryFn: () =>
      getOrgById({
        data: {
          id: orgId || "",
        },
      }),
  });
  const search = useSearch({ from: "/orgs/$orgId" }) as { tab?: Tab };
  const [active, setActive] = useState<Tab>((search.tab as Tab) ?? "general");

  const org = useMemo(
    () => ({ id: orgId, name: orgData?.org?.name || "" }),
    [orgId, orgData]
  );

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
          <OrgTabs active={active} onChange={setActive} />

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
