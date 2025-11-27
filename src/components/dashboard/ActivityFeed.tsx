import { Activity, Edit, Eye, Share2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
      <Card className="bg-[#141921]/50 border-[#2a3241] backdrop-blur-sm h-full">
        <CardContent className="text-center py-12 flex flex-col items-center justify-center h-full">
          <div className="bg-[#1c232d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-[#9aa4b2]" />
          </div>
          <p className="text-[#9aa4b2]">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#141921]/50 border-[#2a3241] backdrop-blur-sm h-full">
      <CardContent className="p-0">
        <div className="divide-y divide-[#2a3241]">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action]
            const label = actionLabels[activity.action]
            
            // Determine icon color based on action
            let iconColor = 'text-[#9aa4b2]'
            let iconBg = 'bg-[#1c232d]'
            
            if (activity.action === 'view') {
              iconColor = 'text-blue-400'
              iconBg = 'bg-blue-400/10'
            } else if (activity.action === 'delete') {
              iconColor = 'text-red-400'
              iconBg = 'bg-red-400/10'
            } else if (activity.action === 'share') {
              iconColor = 'text-emerald-400'
              iconBg = 'bg-emerald-400/10'
            }

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-[#1c232d]/30 transition-colors"
              >
                <div className={`p-2 rounded-lg ${iconBg} ${iconColor} mt-0.5`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e6e9ee]">
                    <span className="font-medium">{label}</span> secret{' '}
                    <span className="font-medium text-[#4c89b6]">{activity.secretName}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#9aa4b2]">
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
                        <span className="font-mono bg-[#1c232d] px-1.5 py-0.5 rounded text-[10px]">
                          {activity.ipAddress}
                        </span>
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
