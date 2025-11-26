import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, Eye, ShieldAlert } from 'lucide-react'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { decryptSecretWithPassword } from '@/lib/client-secret-crypto'

export const Route = createFileRoute('/s/$id')({
  component: PublicSecretPage,
})

function PublicSecretPage() {
  const { id } = Route.useParams()
  const trpc = useTRPC()

  const [password, setPassword] = useState('')
  const [decryptedData, setDecryptedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: viewSecret, isPending } = useMutation(
    trpc.secrets.publicView.mutationOptions(),
  )

  const handleViewSecret = async () => {
    // if (!password.trim()) {
    //   // setError('Password is required to decrypt this secret.')
    //   return
    // }

    setError(null)
    setDecryptedData(null)

    try {
      const result = await viewSecret({ id })
      if (!result.encryptionSalt) {
        throw new Error('Missing encryption metadata for this secret.')
      }

      const plaintext = await decryptSecretWithPassword({
        ciphertext: result.encryptedPayload.data,
        iv: result.encryptedPayload.iv,
        salt: result.encryptionSalt,
        password: password.trim(),
      })
      setDecryptedData(plaintext)
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt secret')
    }
  }

  const handleCopy = () => {
    if (decryptedData) {
      navigator.clipboard.writeText(decryptedData)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Secure Secret Viewer</CardTitle>
            <CardDescription>
              Enter the password that was shared with you to decrypt this
              secret. Viewing is fully audited and may permanently delete the
              secret if burn-on-read was enabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>
                Never paste secrets into untrusted devices. Only continue if you
                trust this browser and network. The password never leaves your
                device until you click &quot;Decrypt&quot;.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!decryptedData ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Secret Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter the password shared with the secret"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleViewSecret}
                  disabled={isPending}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isPending ? 'Decrypting...' : 'Decrypt secret'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Decrypted secret</Label>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={decryptedData}
                      className="font-mono text-sm"
                    />
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

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Closing this page will not store the secret anywhere. View
                    counts and access logs update immediately.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setDecryptedData(null)}
                >
                  Hide secret
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
