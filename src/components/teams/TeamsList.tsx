import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { CreateTeamDialog } from './CreateTeamDialog'
import { useTRPC } from '@/integrations/trpc/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TeamsListProps {
  orgId?: number
}

export function TeamsList({ orgId }: TeamsListProps) {
  const trpc = useTRPC()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // If no orgId passed, try to get the first one from the list
  const { data: orgs } = useQuery(trpc.organizations.list.queryOptions())
  const effectiveOrgId = orgId || orgs?.[0]?.id

  const { data: org } = useQuery(
    trpc.organizations.get.queryOptions(
      { id: effectiveOrgId! },
      { enabled: !!effectiveOrgId },
    ),
  )

  const { data: teams, isLoading } = useQuery(
    trpc.teams.list.queryOptions(
      { orgId: effectiveOrgId! },
      { enabled: !!effectiveOrgId },
    ),
  )

  if (!effectiveOrgId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No organization selected.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const canCreateTeams = org?.tier !== 'free'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">
            Manage teams within your organization.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!canCreateTeams}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {!canCreateTeams && (
        <div className="bg-muted/50 p-4 rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            Team management is available on Pro Team and Business plans.
            <Button variant="link" className="h-auto p-0 ml-1">
              Upgrade now
            </Button>
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No teams found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teams?.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {team.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {team.slug}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(team.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        orgId={effectiveOrgId}
      />
    </div>
  )
}
