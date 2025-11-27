import { Link } from '@tanstack/react-router'
import { ArrowRight, Plus, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RecentSecret {
  id: string
  name: string
  orgId: string
  orgName: string
  viewCount: number
  maxViews: number | null
  expiresAt: Date | null
  burnOnRead: boolean
  createdAt: Date
}

interface RecentSecretsProps {
  secrets: Array<RecentSecret>
  defaultOrgId?: string
}

export function RecentSecrets({ secrets, defaultOrgId }: RecentSecretsProps) {
  if (secrets.length === 0) {
    return (
      <Card className="bg-[#141921]/50 border-[#2a3241] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#e6e9ee]">Recent Secrets</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="bg-[#1c232d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-[#4c89b6]" />
          </div>
          <h3 className="text-lg font-medium text-[#e6e9ee] mb-2">No secrets created yet</h3>
          <p className="text-[#9aa4b2] mb-6 max-w-sm mx-auto">
            Create your first secure secret to share sensitive information safely.
          </p>
          {defaultOrgId && (
            <Link to="/secrets/create" search={{ orgId: defaultOrgId }}>
              <Button className="bg-[#4c89b6] hover:bg-[#3d7299] text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Secret
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#141921]/50 border-[#2a3241] backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="divide-y divide-[#2a3241]">
          {secrets.map((secret) => (
            <Link
              key={secret.id}
              to="/secrets/$secretId"
              params={{ secretId: secret.id }}
              search={{ orgId: secret.orgId }}
              className="block group hover:bg-[#1c232d]/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-medium text-[#e6e9ee] truncate group-hover:text-[#4c89b6] transition-colors">
                      {secret.name}
                    </p>
                    {secret.burnOnRead && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Burn-on-read
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#9aa4b2]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4c89b6]"></span>
                      {secret.orgName}
                    </span>
                    <span>•</span>
                    <span>{secret.viewCount} views</span>
                    {secret.expiresAt && (
                      <>
                        <span>•</span>
                        <span>
                          Expires{' '}
                          {new Date(secret.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1c232d] group-hover:bg-[#4c89b6]/10 transition-colors">
                  <ArrowRight className="h-4 w-4 text-[#9aa4b2] group-hover:text-[#4c89b6] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {defaultOrgId && (
          <div className="p-4 border-t border-[#2a3241] bg-[#141921]/30">
            <Link to="/secrets" search={{ orgId: defaultOrgId }} className="block">
              <Button variant="ghost" size="sm" className="w-full text-[#9aa4b2] hover:text-[#e6e9ee] hover:bg-[#1c232d]">
                View All Secrets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
