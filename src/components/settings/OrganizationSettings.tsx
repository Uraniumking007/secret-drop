import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { InviteMemberDialog } from './InviteMemberDialog'
import { useTRPC } from '@/integrations/trpc/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function OrganizationSettings() {
  const trpc = useTRPC()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // Get orgId from URL
  const searchParams = new URLSearchParams(window.location.search)
  const orgIdParam = searchParams.get('orgId')

  const { data: orgs, isLoading: orgsLoading } = useQuery(
    trpc.organizations.list.queryOptions(),
  )

  const orgId = orgIdParam ? Number(orgIdParam) : orgs?.[0]?.id

  const { data: org, isLoading: orgLoading } = useQuery(
    trpc.organizations.get.queryOptions({ id: orgId! }, { enabled: !!orgId }),
  )

  const { data: members, isLoading: membersLoading } = useQuery(
    trpc.organizations.getMembers.queryOptions(
      { orgId: orgId! },
      { enabled: !!orgId },
    ),
  )

  const deleteOrganization = useMutation({
    ...trpc.organizations.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.organizations.list.queryKey(),
      })
      navigate({ to: '/dashboard' })
    },
  })

  const handleDelete = async () => {
    if (org?.name !== deleteConfirmation) return

    try {
      await deleteOrganization.mutateAsync({ id: orgId! })
    } catch (error) {
      console.error('Failed to delete organization:', error)
    }
  }

  if (orgsLoading || orgLoading || membersLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!org) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No organization selected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Organization Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your organization members and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <div className="text-sm font-medium">Name</div>
            <div className="text-sm text-muted-foreground">{org.name}</div>
          </div>
          <div className="grid gap-1">
            <div className="text-sm font-medium">Slug</div>
            <div className="text-sm text-muted-foreground">{org.slug}</div>
          </div>
          <div className="grid gap-1">
            <div className="text-sm font-medium">Plan</div>
            <div className="flex items-center gap-2">
              <Badge variant={org.tier === 'free' ? 'secondary' : 'default'}>
                {org.tier === 'pro_team'
                  ? 'Pro Team'
                  : org.tier === 'business'
                    ? 'Business'
                    : 'Free'}
              </Badge>
              {org.tier === 'free' && (
                <Button variant="link" className="h-auto p-0 text-xs">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Members</CardTitle>
          <Button
            size="sm"
            disabled={org.tier === 'free' && (members?.length ?? 0) >= 1}
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image || undefined} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(member.joinedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Delete Organization</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete this organization and all of its data. This
                action cannot be undone.
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        orgId={orgId!}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              organization{' '}
              <span className="font-semibold text-foreground">{org.name}</span>{' '}
              and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Type the organization name to confirm
              </div>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={org.name}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteConfirmation !== org.name || deleteOrganization.isPending
              }
            >
              {deleteOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
