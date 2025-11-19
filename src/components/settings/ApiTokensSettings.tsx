import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus, ExternalLink } from 'lucide-react'

export function ApiTokensSettings() {
  const trpc = useTRPC()

  const { data: tokens, isLoading } = useQuery(
    trpc.apiTokens.list.queryOptions()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Tokens</CardTitle>
        <CardDescription>
          Manage your API tokens for CLI and CI/CD integrations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading tokens...
            </p>
          </div>
        ) : tokens && tokens.length > 0 ? (
          <div className="space-y-3 mb-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{token.name}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>
                      Created: {new Date(token.createdAt).toLocaleDateString()}
                    </div>
                    {token.lastUsedAt && (
                      <div>
                        Last used:{' '}
                        {new Date(token.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                    {token.expiresAt && (
                      <div>
                        Expires:{' '}
                        {new Date(token.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-4">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No API tokens yet.</p>
          </div>
        )}
        <Link to="/dashboard/settings/api-tokens">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Manage API Tokens
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

