import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = useSession()
  const trpc = useTRPC()

  const { data: profile, isLoading } = useQuery(
    trpc.users.getProfile.queryOptions()
  )

  if (!session) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your profile information
            </p>
          </div>
          <Link to="/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <ProfileForm
          initialData={{
            name: profile.name,
            email: profile.email,
            image: profile.image,
            bio: profile.bio,
          }}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified</span>
                    <span className={profile.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                      {profile.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

