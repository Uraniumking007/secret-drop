import { Activity, Building2, Key, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      description: 'Active secrets',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
    {
      title: 'Organizations',
      value: totalOrganizations,
      icon: Building2,
      description: 'Workspaces',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
    },
    {
      title: 'Activity',
      value: recentActivityCount,
      icon: Activity,
      description: 'Events (7d)',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
    },
    {
      title: 'API Tokens',
      value: apiTokensCount,
      icon: Key,
      description: 'Active keys',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
  ]

  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card 
            key={stat.title} 
            className={`bg-[#141921]/50 backdrop-blur-sm border-[#2a3241] hover:border-opacity-50 transition-all duration-300 group`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#9aa4b2] group-hover:text-[#e6e9ee] transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#e6e9ee]">{stat.value}</div>
              <p className="text-xs text-[#9aa4b2] mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
