import { OrganizationDashboard } from "./OrganizationDashboard";
import { PersonalDashboard } from "./PersonalDashboard";

export interface WorkspaceContext {
  type: "personal" | "organization";
  id: string | null;
  organization: any | null;
}

export interface ContextualDashboardProps {
  workspaceContext: WorkspaceContext;
}

export function ContextualDashboard({
  workspaceContext,
}: ContextualDashboardProps) {
  if (
    workspaceContext.type === "organization" &&
    workspaceContext.organization
  ) {
    return (
      <OrganizationDashboard organization={workspaceContext.organization} />
    );
  }

  return <PersonalDashboard />;
}
