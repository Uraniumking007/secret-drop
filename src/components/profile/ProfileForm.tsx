import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ProfileFormProps {
  initialData: {
    name: string
    email: string
    image: string | null
    bio: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [name, setName] = useState(initialData.name)
  const [bio, setBio] = useState(initialData.bio || '')
  const [image, setImage] = useState(initialData.image || '')
  const [isEditing, setIsEditing] = useState(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: updateProfile, isPending } = useMutation(
    trpc.users.updateProfile.mutationOptions()
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(
      {
        name,
        bio: bio || null,
        image: image || null,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['trpc', 'users', 'getProfile'] })
          setIsEditing(false)
        },
      }
    )
  }

  const handleCancel = () => {
    setName(initialData.name)
    setBio(initialData.bio || '')
    setImage(initialData.image || '')
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and public details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                disabled={!isEditing}
                placeholder="https://example.com/avatar.jpg"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL to your profile image
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

