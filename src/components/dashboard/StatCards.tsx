import { Shield, Users, BarChart3 } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

export interface StatCardsProps {
  totalSecrets: number;
  totalTeams: number;
  totalMembers: number;
}

export function StatCards({
  totalSecrets,
  totalTeams,
  totalMembers,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Secrets"
        value={totalSecrets}
        icon={<Shield className="h-5 w-5" />}
        description="Active secret drops"
      />
      <StatCard
        title="Total Teams"
        value={totalTeams}
        icon={<Users className="h-5 w-5" />}
        description="Active teams"
      />
      <StatCard
        title="Total Members"
        value={totalMembers}
        icon={<BarChart3 className="h-5 w-5" />}
        description="Organization members"
      />
    </div>
  );
}
