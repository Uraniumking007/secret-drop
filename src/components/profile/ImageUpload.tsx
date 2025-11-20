import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Upload, X } from 'lucide-react'
import ImageKit from 'imagekit-javascript'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  disabled?: boolean
  userId: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  disabled = false,
  userId,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const trpc = useTRPC()

  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreview(currentImageUrl || null)
  }, [currentImageUrl])

  // Get ImageKit authentication parameters
  const { data: authParams, isLoading: authLoading } = useQuery(
    trpc.users.getImageKitAuth.queryOptions(),
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authParams) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Initialize ImageKit
      const imagekit = new ImageKit({
        publicKey: authParams.publicKey,
        urlEndpoint: authParams.urlEndpoint,
      })

      // Upload file to ImageKit
      const result = await imagekit.upload({
        file: file,
        fileName: `avatar-${userId}-${Date.now()}.${file.name.split('.').pop()}`,
        folder: '/avatars/',
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        useUniqueFileName: true,
        tags: ['avatar', 'profile'],
      })

      if (result.url) {
        setPreview(result.url)
        onImageUploaded(result.url)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Please try again.')
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-20 w-20">
        {preview ? <AvatarImage src={preview} alt="Profile" /> : null}
        <AvatarFallback className="text-2xl">U</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading || authLoading}
            className="hidden"
            id="avatar-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || authLoading}
            className="w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>
          {preview && !disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
              className="w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>
    </div>
  )
}
