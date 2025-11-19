import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateTeamDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: number
}

export function CreateTeamDialog({ open, onOpenChange, orgId }: CreateTeamDialogProps) {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [error, setError] = useState<string | null>(null)
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const { mutateAsync: createTeam, isPending } = useMutation(
        trpc.teams.create.mutationOptions()
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            await createTeam({
                orgId,
                name,
                slug,
            })
            onOpenChange(false)
            setName('')
            setSlug('')
            queryClient.invalidateQueries({ queryKey: trpc.teams.list.queryKey() })
        } catch (err: any) {
            setError(err.message || 'Failed to create team')
        }
    }

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
            setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                        Create a team to organize members and secrets.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Engineering"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Team Slug</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. engineering"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
