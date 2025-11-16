import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, ChevronDown, Plus } from 'lucide-react'
import { TierBadge } from './TierBadge'
import { Link } from '@tanstack/react-router'

interface OrgSwitcherProps {
  currentOrgId?: number
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const navigate = useNavigate()
  const trpc = useTRPC()
  const { data: orgs, isLoading } = useQuery(trpc.organizations.list.queryOptions())
  const currentOrg = orgs?.find((org) => org.id === currentOrgId) || orgs?.[0]

  if (isLoading || !orgs) {
    return (
      <Button variant="outline" disabled className="w-full justify-start">
        <Building2 className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (orgs.length === 0) {
    return (
      <Button variant="outline" asChild className="w-full justify-start">
        <Link to="/organizations/create">
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {currentOrg?.name?.charAt(0).toUpperCase() || 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentOrg?.name}</span>
              {currentOrg?.tier && (
                <TierBadge tier={currentOrg.tier} className="text-xs" />
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              navigate({
                to: '/secrets',
                search: { orgId: org.id },
              })
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  {org.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{org.name}</span>
            </div>
            <TierBadge tier={org.tier} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/organizations/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

