import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentSecrets } from '@/components/dashboard/RecentSecrets'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

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
    trpc.users.getRecentSecrets.queryOptions({ limit: 5 }),
  )

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    trpc.users.getRecentActivity.queryOptions({ limit: 10 }),
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a3241] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e6e9ee]">
            {getGreeting()}, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-[#9aa4b2] mt-1">
            Here's what's happening with your secrets today.
          </p>
        </div>
        <div className="flex items-center gap-3">
           {/* Placeholder for future quick actions if needed */}
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStats
            totalSecrets={stats.totalSecrets}
            totalOrganizations={stats.totalOrganizations}
            recentActivityCount={stats.recentActivityCount}
            apiTokensCount={stats.apiTokensCount}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Secrets (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#e6e9ee]">Recent Secrets</h2>
          </div>
          <RecentSecrets
            secrets={recentSecrets || []}
            defaultOrgId={defaultOrgId}
          />
        </div>

        {/* Right Column: Activity Feed (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#e6e9ee]">Activity Log</h2>
          </div>
          <ActivityFeed activities={recentActivity || []} />
        </div>
      </div>
    </div>
  )
}
