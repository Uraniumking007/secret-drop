import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { SecretForm } from '@/components/secrets/SecretForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { EncryptionLibrary } from '@/lib/encryption'
import type { ExpirationOption } from '@/lib/secret-utils'

export const Route = createFileRoute('/secrets/create')({
  component: CreateSecretPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orgId: Number(search.orgId) || undefined,
    }
  },
})

function CreateSecretPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const trpc = useTRPC()
  const { data: orgs } = useQuery(trpc.organizations.list.queryOptions())
  const orgId = search.orgId || orgs?.[0]?.id

  const { mutateAsync: createSecret } = useMutation(trpc.secrets.create.mutationOptions())

  const [error, setError] = useState<string | null>(null)

  if (!orgId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please create or join an organization to create secrets.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: {
    name: string
    data: string
    encryptionLibrary: EncryptionLibrary
    expiration?: ExpirationOption
    maxViews?: number | null
    password?: string
    burnOnRead: boolean
  }) => {
    setError(null)
    try {
      const result = await createSecret({
        orgId,
        name: data.name,
        data: data.data,
        encryptionLibrary: data.encryptionLibrary,
        expiration: data.expiration,
        maxViews: data.maxViews,
        password: data.password,
        burnOnRead: data.burnOnRead,
      })

      // Store encryption key in sessionStorage (client-side only)
      if (result.encryptionKey) {
        sessionStorage.setItem(`secret_key_${result.id}`, result.encryptionKey)
      }

      navigate({
        to: '/secrets/$secretId',
        params: { secretId: result.id.toString() },
        search: { orgId },
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create secret')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Secret</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <SecretForm onSubmit={handleSubmit} isLoading={createSecret.isPending} />
        </CardContent>
      </Card>
    </div>
  )
}

