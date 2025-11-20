import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentSecrets } from '@/components/dashboard/RecentSecrets'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageState } from '@/components/layout/PageState'

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

  if (statsLoading || secretsLoading || activityLoading) {
    return <DashboardSkeleton />
  }

  if (!session) {
    return (
      <PageState
        maxWidth="sm"
        title="Sign in required"
        description="Please sign in to view your dashboard."
      />
    )
  }

  return (
    <PageContainer>
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
    </PageContainer>
  )
}
