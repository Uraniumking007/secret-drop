import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { SecretCard } from '@/components/secrets/SecretCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TierBadge } from '@/components/TierBadge'
import { Plus, Shield, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export const Route = createFileRoute('/secrets/')({
  component: SecretsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orgId: Number(search.orgId) || undefined,
    }
  },
})

function SecretsPage() {
  const search = Route.useSearch()
  const trpc = useTRPC()
  const { data: orgs } = useQuery(trpc.organizations.list.queryOptions())
  const orgId = search.orgId || orgs?.[0]?.id
  const currentOrg = orgs?.find((org) => org.id === orgId)

  const { data: secrets, isLoading } = useQuery({
    ...trpc.secrets.list.queryOptions({ orgId: orgId! }),
    enabled: !!orgId,
  })

  const [searchQuery, setSearchQuery] = useState('')

  const filteredSecrets = secrets?.filter((secret) =>
    secret.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!orgId) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
            <CardDescription>
              Please create or join an organization to manage secrets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Create Organization</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Secrets</h1>
            {currentOrg && <TierBadge tier={currentOrg.tier} />}
          </div>
          {currentOrg && (
            <p className="text-muted-foreground">
              Managing secrets for {currentOrg.name}
            </p>
          )}
        </div>
        <Link to="/secrets/create" search={{ orgId }}>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Secret
          </Button>
        </Link>
      </div>

      {secrets && secrets.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading secrets...</p>
        </div>
      ) : filteredSecrets && filteredSecrets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSecrets.map((secret) => (
            <SecretCard
              key={secret.id}
              id={secret.id}
              name={secret.name}
              viewCount={secret.viewCount}
              maxViews={secret.maxViews}
              expiresAt={secret.expiresAt}
              burnOnRead={secret.burnOnRead}
              orgId={secret.orgId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">
              {searchQuery ? 'No secrets found' : 'No secrets yet'}
            </CardTitle>
            <CardDescription className="mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first secret to get started with secure secret management.'}
            </CardDescription>
            {!searchQuery && (
              <Link to="/secrets/create" search={{ orgId }}>
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Secret
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

