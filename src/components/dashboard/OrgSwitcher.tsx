import { useQuery } from '@tanstack/react-query'
import { PlusCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTRPC } from '@/integrations/trpc/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'

interface OrgSwitcherProps {
  className?: string
  onOpenChange?: (open: boolean) => void
}

export function OrgSwitcher({ className, onOpenChange }: OrgSwitcherProps) {
  const { data: session } = useSession()
  const currentOrgId = session
    ? session.activeOrgId || session.session?.activeOrgId
    : null
  const trpc = useTRPC()
  const navigate = useNavigate()

  const { data: orgs, isLoading } = useQuery(
    trpc.organizations.list.queryOptions(),
  )

  const handleOrgChange = (value: string) => {
    if (value === 'create_new') {
      navigate({ to: '/organizations/create' })
      return
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'h-10 w-full animate-pulse rounded-md bg-muted',
          className,
        )}
      />
    )
  }

  const activeOrg = orgs?.find((o) => o.id === currentOrgId) || orgs?.[0]

  const selectValue = activeOrg ? activeOrg.id.toString() : undefined

  return (
    <div className={cn('w-full', className)}>
      <Select
        value={selectValue}
        onValueChange={handleOrgChange}
        onOpenChange={onOpenChange}
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select Organization">
            {activeOrg?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {orgs?.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              <div className="flex items-center justify-between w-full gap-2">
                <span className="truncate font-medium">{org.name}</span>
                {org.tier === 'free' && (
                  <span className="text-xs text-muted-foreground">(Free)</span>
                )}
              </div>
            </SelectItem>
          ))}
          <div className="p-1 border-t mt-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-8 px-2"
              onClick={(e) => {
                e.preventDefault()
                navigate({ to: '/organizations/create' })
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Org
            </Button>
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}
