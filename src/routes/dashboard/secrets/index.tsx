import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { SecretTable } from '@/components/secrets/SecretTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TierBadge } from '@/components/TierBadge'
import { Plus, Shield, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { EmptyState } from '@/components/secrets/EmptyState'

export const Route = createFileRoute('/dashboard/secrets/')({
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
        <Link to="/dashboard/secrets/create" search={{ orgId }}>
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
        <Card>
          <CardContent>
            <SecretTable secrets={filteredSecrets} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState orgId={orgId} searchQuery={searchQuery} />
      )}
    </div>
  )
}
