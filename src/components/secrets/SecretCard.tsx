import { Link } from '@tanstack/react-router'
import { Eye, Clock, Flame, Lock } from 'lucide-react'
import { formatExpiration, isExpired } from '@/lib/secret-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SecretCardProps {
  id: number
  name: string
  viewCount: number
  maxViews: number | null
  expiresAt: Date | null
  burnOnRead: boolean
  orgId: number
}

export function SecretCard({
  id,
  name,
  viewCount,
  maxViews,
  expiresAt,
  burnOnRead,
  orgId,
}: SecretCardProps) {
  const expired = expiresAt ? isExpired(expiresAt) : false
  const viewLimitReached = maxViews ? viewCount >= maxViews : false

  return (
    <Link
      to="/secrets/$secretId"
      params={{ secretId: id.toString() }}
      search={{ orgId }}
      className="block"
    >
      <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {burnOnRead && (
                <Badge variant="outline" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  Burn
                </Badge>
              )}
              {expired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {viewLimitReached && (
                <Badge variant="secondary" className="text-xs">
                  Limit
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>
                {viewCount}
                {maxViews ? ` / ${maxViews}` : ''} views
              </span>
            </div>
            {expiresAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className={expired ? 'text-destructive' : ''}>
                  {formatExpiration(expiresAt)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

