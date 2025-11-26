import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { ExpirationOption } from '@/lib/secret-utils'
import type { EncryptionLibrary } from '@/lib/encryption'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTRPC } from '@/integrations/trpc/react'

interface SecretFormProps {
  onSubmit: (data: {
    name: string
    data: string
    encryptionLibrary: EncryptionLibrary
    expiration?: ExpirationOption
    maxViews?: number | null
    password?: string
    burnOnRead: boolean
    teamId?: string | null
  }) => Promise<void>
  isLoading?: boolean
  userTier?: 'free' | 'pro_team' | 'business'
  orgId?: string
  initialData?: {
    name?: string
    data?: string
    expiration?: ExpirationOption
    maxViews?: number | null
    password?: string
    burnOnRead?: boolean
  }
}

export function SecretForm({
  onSubmit,
  isLoading,
  initialData,
  userTier = 'free',
  orgId,
}: SecretFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [data, setData] = useState(initialData?.data || '')
  const [encryptionLibrary, setEncryptionLibrary] =
    useState<EncryptionLibrary>('webcrypto')
  const [expiration, setExpiration] = useState<ExpirationOption | undefined>(
    initialData?.expiration,
  )
  const [maxViews, setMaxViews] = useState<string>(
    initialData?.maxViews?.toString() || '',
  )
  const [password, setPassword] = useState(initialData?.password || '')
  const [burnOnRead, setBurnOnRead] = useState(initialData?.burnOnRead || false)
  const [showPassword, setShowPassword] = useState(false)
  const [teamId, setTeamId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      data,
      encryptionLibrary,
      expiration,
      maxViews: maxViews ? parseInt(maxViews, 10) : null,
      password: password || undefined,
      burnOnRead: userTier === 'free' ? false : burnOnRead,
      teamId,
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
          onValueChange={(value) =>
            setEncryptionLibrary(value as EncryptionLibrary)
          }
          disabled={isLoading}
        >
          <SelectTrigger id="encryption-library">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webcrypto">
              Web Crypto API (Recommended)
            </SelectItem>
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
            setExpiration(
              value === 'never' ? undefined : (value as ExpirationOption),
            )
          }
          disabled={isLoading}
        >
          <SelectTrigger id="expiration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {userTier !== 'free' && (
              <SelectItem value="never">Never</SelectItem>
            )}
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="1d">1 Day</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            {userTier !== 'free' && (
              <SelectItem value="30d">30 Days</SelectItem>
            )}
          </SelectContent>
        </Select>
        {userTier === 'free' && (
          <p className="text-xs text-muted-foreground">
            Free tier limited to 7 days expiration. Upgrade for longer
            durations.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxViews">
          Max Views{' '}
          {userTier === 'free' ? '(Max 10)' : '(leave empty for unlimited)'}
        </Label>
        <Input
          id="maxViews"
          type="number"
          min="1"
          max={userTier === 'free' ? 10 : undefined}
          value={maxViews}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (userTier === 'free' && val > 10) {
              setMaxViews('10')
            } else {
              setMaxViews(e.target.value)
            }
          }}
          placeholder={userTier === 'free' ? 'Max 10' : 'e.g., 10'}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          {userTier === 'free'
            ? 'Free tier: Max 10 views. Upgrade for unlimited.'
            : 'Leave empty for unlimited views.'}
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
          disabled={isLoading || userTier === 'free'}
        />
        <Label
          htmlFor="burnOnRead"
          className={`text-sm font-normal ${userTier === 'free' ? 'text-muted-foreground' : ''}`}
        >
          Burn on read (delete after first view){' '}
          {userTier === 'free' && '- Pro/Business only'}
        </Label>
      </div>

      {userTier !== 'free' && orgId && (
        <div className="space-y-2">
          <Label htmlFor="team">Share with Team (Optional)</Label>
          <TeamSelect
            orgId={orgId}
            value={teamId}
            onChange={setTeamId}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Select a team to share this secret with. Members of the team will be
            able to view it.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? 'Updating...' : 'Creating...'}
          </>
        ) : initialData ? (
          'Update Secret'
        ) : (
          'Create Secret'
        )}
      </Button>
    </form>
  )
}

function TeamSelect({
  orgId,
  value,
  onChange,
  disabled,
}: {
  orgId: string
  value?: string | null
  onChange: (val: string | null) => void
  disabled?: boolean
}) {
  const trpc = useTRPC()
  const { data: teams } = useQuery(
    trpc.teams.list.queryOptions({ orgId }, { enabled: !!orgId }),
  )

  return (
    <Select
      value={value ?? 'none'}
      onValueChange={(val) => onChange(val === 'none' ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger id="team">
        <SelectValue placeholder="Select a team (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None (Private / Link only)</SelectItem>
        {teams?.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
