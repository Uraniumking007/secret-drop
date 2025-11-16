import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Plus, ArrowRight } from 'lucide-react'

interface RecentSecret {
  id: number
  name: string
  orgId: number
  orgName: string
  viewCount: number
  maxViews: number | null
  expiresAt: Date | null
  burnOnRead: boolean
  createdAt: Date
}

interface RecentSecretsProps {
  secrets: RecentSecret[]
  defaultOrgId?: number
}

export function RecentSecrets({ secrets, defaultOrgId }: RecentSecretsProps) {
  if (secrets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Secrets</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No secrets yet</p>
          {defaultOrgId && (
            <Link to="/secrets/create" search={{ orgId: defaultOrgId }}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Secret
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Secrets</CardTitle>
        {defaultOrgId && (
          <Link to="/secrets" search={{ orgId: defaultOrgId }}>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {secrets.map((secret) => (
            <Link
              key={secret.id}
              to="/secrets/$secretId"
              params={{ secretId: secret.id.toString() }}
              search={{ orgId: secret.orgId }}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{secret.name}</p>
                    {secret.burnOnRead && (
                      <span className="text-xs text-muted-foreground">🔥</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{secret.orgName}</span>
                    <span>{secret.viewCount} views</span>
                    {secret.expiresAt && (
                      <span>
                        Expires{' '}
                        {new Date(secret.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

