import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Building2, Activity, Key } from 'lucide-react'

interface DashboardStatsProps {
  totalSecrets: number
  totalOrganizations: number
  recentActivityCount: number
  apiTokensCount: number
}

export function DashboardStats({
  totalSecrets,
  totalOrganizations,
  recentActivityCount,
  apiTokensCount,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Secrets',
      value: totalSecrets,
      icon: Shield,
      description: 'Across all organizations',
    },
    {
      title: 'Organizations',
      value: totalOrganizations,
      icon: Building2,
      description: 'Workspaces you belong to',
    },
    {
      title: 'Recent Activity',
      value: recentActivityCount,
      icon: Activity,
      description: 'Last 7 days',
    },
    {
      title: 'API Tokens',
      value: apiTokensCount,
      icon: Key,
      description: 'Active tokens',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

