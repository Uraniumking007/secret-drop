import { Activity, Edit, Eye, Share2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

type ActivityAction = 'view' | 'edit' | 'delete' | 'share'

interface ActivityItem {
  id: string
  secretId: string | null
  secretName: string
  action: ActivityAction
  ipAddress: string | null
  accessedAt: Date | string
}

interface ActivityFeedProps {
  activities: Array<ActivityItem>
}

const actionIcons: Record<ActivityAction, typeof Eye> = {
  view: Eye,
  edit: Edit,
  delete: Trash2,
  share: Share2,
}

const actionLabels: Record<ActivityAction, string> = {
  view: 'Viewed',
  edit: 'Edited',
  delete: 'Deleted',
  share: 'Shared',
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action]
            const label = actionLabels[activity.action]
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="p-2 rounded-full bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{label}</span> secret{' '}
                    <span className="font-medium">{activity.secretName}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {formatTimeAgo(
                        activity.accessedAt instanceof Date
                          ? activity.accessedAt
                          : new Date(activity.accessedAt),
                      )}
                    </span>
                    {activity.ipAddress && (
                      <>
                        <span>•</span>
                        <span>{activity.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
