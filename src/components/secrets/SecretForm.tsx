import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { ExpirationOption } from '@/lib/secret-utils'
import type { EncryptionLibrary } from '@/lib/encryption'

interface SecretFormProps {
  onSubmit: (data: {
    name: string
    data: string
    encryptionLibrary: EncryptionLibrary
    expiration?: ExpirationOption
    maxViews?: number | null
    password?: string
    burnOnRead: boolean
  }) => Promise<void>
  isLoading?: boolean
  initialData?: {
    name?: string
    data?: string
    expiration?: ExpirationOption
    maxViews?: number | null
    password?: string
    burnOnRead?: boolean
  }
}

export function SecretForm({ onSubmit, isLoading, initialData }: SecretFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [data, setData] = useState(initialData?.data || '')
  const [encryptionLibrary, setEncryptionLibrary] = useState<EncryptionLibrary>('webcrypto')
  const [expiration, setExpiration] = useState<ExpirationOption | undefined>(
    initialData?.expiration
  )
  const [maxViews, setMaxViews] = useState<string>(
    initialData?.maxViews?.toString() || ''
  )
  const [password, setPassword] = useState(initialData?.password || '')
  const [burnOnRead, setBurnOnRead] = useState(initialData?.burnOnRead || false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      data,
      encryptionLibrary,
      expiration,
      maxViews: maxViews ? parseInt(maxViews, 10) : null,
      password: password || undefined,
      burnOnRead,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Secret Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Database Password"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data">Secret Value</Label>
        <Textarea
          id="data"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter your secret value here..."
          rows={6}
          required
          disabled={isLoading}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="encryption-library">Encryption Library</Label>
        <Select
          value={encryptionLibrary}
          onValueChange={(value) => setEncryptionLibrary(value as EncryptionLibrary)}
          disabled={isLoading}
        >
          <SelectTrigger id="encryption-library">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webcrypto">Web Crypto API (Recommended)</SelectItem>
            <SelectItem value="crypto-js">Crypto-JS</SelectItem>
            <SelectItem value="noble">@noble/ciphers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiration">Expiration</Label>
        <Select
          value={expiration || 'never'}
          onValueChange={(value) =>
            setExpiration(value === 'never' ? undefined : (value as ExpirationOption))
          }
          disabled={isLoading}
        >
          <SelectTrigger id="expiration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="1d">1 Day</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxViews">Max Views (leave empty for unlimited)</Label>
        <Input
          id="maxViews"
          type="number"
          min="1"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
          placeholder="e.g., 10"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Free tier: Max 10 views. Leave empty for unlimited (Pro/Business tiers)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password Protection (optional)</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Optional password to protect this secret"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="showPassword" className="text-sm font-normal">
            Show password
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="burnOnRead"
          checked={burnOnRead}
          onCheckedChange={setBurnOnRead}
          disabled={isLoading}
        />
        <Label htmlFor="burnOnRead" className="text-sm font-normal">
          Burn on read (delete after first view) - Pro Team/Business tier only
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Secret'}
      </Button>
    </form>
  )
}

