import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/organizations/create')({
  component: CreateOrganization,
})

function CreateOrganization() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createOrganization = useMutation({
    ...trpc.organizations.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.organizations.list.queryKey(),
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.length < 3) return

    setIsSubmitting(true)
    try {
      await createOrganization.mutateAsync({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      })
      throw redirect({
        to: '/dashboard',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('redirect')) {
        throw error
      }
      console.error('Failed to create organization:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Organization"
                minLength={3}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
