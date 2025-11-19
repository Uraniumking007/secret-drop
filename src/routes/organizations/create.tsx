import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
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
  const createOrganization = trpc.organizations.createOrganization.useMutation({
    onSuccess: () => {
      // Invalidate and refetch data after successful creation
      trpc.organizations.getUserOrganizations.invalidate()
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      await createOrganization.mutateAsync(value)
      // Redirect to the dashboard or the new organization's page
      throw redirect({
        to: '/dashboard',
      })
    },
    validatorAdapter: zodValidator,
  })

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <form.Field
                name="name"
                validators={{
                  onChange: z
                    .string()
                    .min(3, 'Organization name must be at least 3 characters'),
                }}
                children={(field) => (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </div>
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending
                ? 'Creating...'
                : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
