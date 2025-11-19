import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentSecrets } from '@/components/dashboard/RecentSecrets'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = useSession()
  const trpc = useTRPC()

  const { data: stats, isLoading: statsLoading } = useQuery(
    trpc.users.getDashboardStats.queryOptions(),
  )

  const { data: recentSecrets, isLoading: secretsLoading } = useQuery(
    trpc.users.getRecentSecrets.queryOptions({ limit: 10 }),
  )

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    trpc.users.getRecentActivity.queryOptions({ limit: 20 }),
  )

  const { data: orgs } = useQuery(trpc.organizations.list.queryOptions())
  const defaultOrgId = orgs?.[0]?.id

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (statsLoading || secretsLoading || activityLoading) {
    return <DashboardSkeleton />
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please sign in to view your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {session.user.name || session.user.email}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's a summary of your account activity.
        </p>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DashboardStats
                totalSecrets={stats.totalSecrets}
                totalOrganizations={stats.totalOrganizations}
                recentActivityCount={stats.recentActivityCount}
                apiTokensCount={stats.apiTokensCount}
              />
            </div>
            <div className="lg:col-span-2 grid gap-6">
              <RecentSecrets
                secrets={recentSecrets || []}
                defaultOrgId={defaultOrgId}
              />
              <ActivityFeed activities={recentActivity || []} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
