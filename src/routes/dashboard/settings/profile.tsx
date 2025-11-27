import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import ImageKit from 'imagekit-javascript'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTRPC } from '@/integrations/trpc/react'

import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/dashboard/settings/profile')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const { data: session } = useSession()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [name, setName] = useState(session?.user.name || '')
  const [bio, setBio] = useState('') 
  const [image, setImage] = useState(session?.user.image || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch latest profile data to ensure we have bio
  const { data: profile } = useQuery({
    ...trpc.users.getProfile.queryOptions(),
    enabled: !!session,
  })

  // Update local state when profile data loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setImage(profile.image || '')
    }
  }, [profile])

  const { mutateAsync: updateProfile } = useMutation(
    trpc.users.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.users.getProfile.queryOptions())
        // Force session refresh if needed, or just rely on getProfile
        toast.success('Profile updated successfully')
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update profile')
      },
    }),
  )

  const { data: imageKitAuth } = useQuery(
    trpc.users.getImageKitAuth.queryOptions(),
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    if (!imageKitAuth) {
      toast.error('Image upload service not available')
      return
    }

    setIsUploading(true)
    try {
      const imagekit = new ImageKit({
        publicKey: imageKitAuth.publicKey,
        urlEndpoint: imageKitAuth.urlEndpoint,
      })

      const result = await imagekit.upload({
        file,
        fileName: `avatar_${session?.user.id}_${Date.now()}`,
        useUniqueFileName: true,
        folder: '/avatars',
        token: imageKitAuth.token,
        signature: imageKitAuth.signature,
        expire: imageKitAuth.expire,
      })

      setImage(result.url)
      toast.success('Image uploaded successfully')
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        name,
        bio,
        image,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  const initials = (name || session.user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[#e6e9ee]">Profile</h3>
        <p className="text-sm text-[#9aa4b2]">
          Manage your profile information
        </p>
      </div>

      <Card className="bg-[#141921]/50 border-[#2a3241]">
        <CardHeader>
          <CardTitle className="text-[#e6e9ee]">Profile Information</CardTitle>
          <CardDescription className="text-[#9aa4b2]">
            Update your profile information and public details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-[#2a3241]">
                <AvatarImage src={image} />
                <AvatarFallback className="text-lg bg-[#1c232d] text-[#e6e9ee]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-[#1c232d] border-[#2a3241] text-[#e6e9ee] hover:bg-[#2a3241] hover:text-white"
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Photo
                  </Button>
                  {image && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setImage('')}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-[#9aa4b2]">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#e6e9ee]">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#e6e9ee]">Email</Label>
              <Input
                id="email"
                value={session.user.email}
                disabled
                className="bg-[#1c232d] border-[#2a3241] text-[#9aa4b2]"
              />
              <p className="text-xs text-[#9aa4b2]">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[#e6e9ee]">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="resize-none bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6]"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
                className="bg-[#4c89b6] hover:bg-[#3d7299] text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
