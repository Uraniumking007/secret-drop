import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ImageUpload } from './ImageUpload'

interface ProfileFormProps {
  initialData: {
    name: string
    email: string
    image: string | null
    bio: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: session } = useSession()
  const [name, setName] = useState(initialData.name)
  const [bio, setBio] = useState(initialData.bio || '')
  const [image, setImage] = useState(initialData.image || '')
  const [isEditing, setIsEditing] = useState(false)
  const isSubmittingRef = useRef(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Update local state when initialData changes, but only if we're not editing
  useEffect(() => {
    if (!isEditing && !isSubmittingRef.current) {
      setName(initialData.name)
      setBio(initialData.bio || '')
      setImage(initialData.image || '')
    }
  }, [initialData, isEditing])

  const { mutate: updateProfile, isPending } = useMutation(
    trpc.users.updateProfile.mutationOptions(),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Only submit if we're in editing mode
    if (!isEditing) {
      return
    }

    isSubmittingRef.current = true
    updateProfile(
      {
        name,
        bio: bio || null,
        image: image || null,
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          isSubmittingRef.current = false
          // Invalidate after a short delay to allow state to update first
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ['trpc', 'users', 'getProfile'],
            })
          }, 100)
        },
        onError: () => {
          isSubmittingRef.current = false
        },
      },
    )
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleCancel = () => {
    setName(initialData.name)
    setBio(initialData.bio || '')
    setImage(initialData.image || '')
    setIsEditing(false)
    isSubmittingRef.current = false
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
          {session?.user?.id && (
            <ImageUpload
              currentImageUrl={image || null}
              onImageUploaded={(url) => setImage(url)}
              disabled={!isEditing}
              userId={session.user.id}
            />
          )}

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
              <Button type="button" onClick={handleEditClick}>
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
