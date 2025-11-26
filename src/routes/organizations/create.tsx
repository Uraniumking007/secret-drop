import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, ChevronLeft } from 'lucide-react'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/organizations/create')({
  component: CreateOrganization,
})

function CreateOrganization() {
  const navigate = useNavigate()
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

  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.length < 3) return

    setIsSubmitting(true)
    try {
      await createOrganization.mutateAsync({
        name,
        slug,
      })
      await navigate({
        to: '/dashboard',
      })
    } catch (error) {
      console.error('Failed to create organization:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ChevronLeft className="h-4 w-4" />
          <Link to="/dashboard" className="text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Create Organization
            </CardTitle>
            <CardDescription className="text-base">
              Create a shared workspace for your team to collaborate and manage
              secrets securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Organization Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  minLength={3}
                  required
                  className="h-11"
                  autoFocus
                />
                {name && (
                  <p className="text-xs text-muted-foreground">
                    Your organization URL will be:{' '}
                    <span className="font-mono text-primary">
                      /dashboard/{slug}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link to="/dashboard">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:ml-auto sm:w-auto min-w-[140px]"
                  disabled={isSubmitting || !name || name.length < 3}
                >
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <p className="text-xs text-muted-foreground text-center w-full">
              By creating an organization, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
