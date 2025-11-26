import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, Eye, Trash2 } from 'lucide-react'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SecretActivityLog } from '@/components/secrets/SecretActivityLog'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/secrets/$secretId')({
  component: SecretViewPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orgId: typeof search.orgId === 'string' ? search.orgId : undefined,
    }
  },
})

function SecretViewPage() {
  const navigate = useNavigate()
  const { secretId } = Route.useParams()
  const search = Route.useSearch()
  const orgId = search.orgId

  const [password, setPassword] = useState('')
  const [encryptionLibrary, setEncryptionLibrary] = useState<
    'webcrypto' | 'crypto-js' | 'noble'
  >('webcrypto')
  const [decryptedData, setDecryptedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const trpc = useTRPC()
  const { mutateAsync: getSecret } = useMutation(
    trpc.secrets.get.mutationOptions(),
  )
  const { mutateAsync: deleteSecret } = useMutation(
    trpc.secrets.delete.mutationOptions({
      onSuccess(data, variables, onMutateResult, context) {
        context?.client?.invalidateQueries({
          queryKey: trpc.secrets.list.queryOptions({ orgId }).queryKey,
        })
        navigate({ to: '/dashboard/secrets', search: { orgId } })
        toast.success('Secret deleted successfully')
      },
      onError(error, variables, onMutateResult, context) {
        setError(error.message || 'Failed to delete secret')
      },
    }),
  )

  // Get encryption key from sessionStorage
  const encryptionKey =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(`secret_key_${secretId}`)
      : null

  const handleViewSecret = async () => {
    if (!encryptionKey) {
      setError('Encryption key not found. Please recreate the secret.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const result = await getSecret({
        id: secretId,
        encryptionKey,
        password: password || undefined,
        encryptionLibrary,
      })

      setDecryptedData(result.data)
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt secret')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (decryptedData) {
      navigator.clipboard.writeText(decryptedData)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this secret? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      await deleteSecret({ id: secretId })
      navigate({ to: '/dashboard/secrets', search: { orgId } })
    } catch (err: any) {
      setError(err.message || 'Failed to delete secret')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Secret Details</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!decryptedData ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="encryption-library">Encryption Library</Label>
                <select
                  id="encryption-library"
                  value={encryptionLibrary}
                  onChange={(e) =>
                    setEncryptionLibrary(
                      e.target.value as 'webcrypto' | 'crypto-js' | 'noble',
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="webcrypto">Web Crypto API</option>
                  <option value="crypto-js">Crypto-JS</option>
                  <option value="noble">@noble/ciphers</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (if required)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password if this secret is password-protected"
                />
              </div>

              <Button
                onClick={handleViewSecret}
                disabled={isLoading || !encryptionKey}
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isLoading ? 'Decrypting...' : 'View Secret'}
              </Button>

              {!encryptionKey && (
                <p className="text-sm text-muted-foreground">
                  Encryption key not found. You can only view secrets you
                  created in this session.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Secret Value</Label>
                <div className="relative">
                  <pre className="rounded-md border bg-muted p-4 font-mono text-sm overflow-auto">
                    {decryptedData}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setDecryptedData(null)}
                className="w-full"
              >
                Hide Secret
              </Button>
            </>
          )}

          <div className="pt-6 border-t">
            <SecretActivityLog secretId={secretId} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
