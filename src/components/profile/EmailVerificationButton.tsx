import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Mail } from 'lucide-react'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'

interface EmailVerificationButtonProps {
  email: string
}

export function EmailVerificationButton({
  email,
}: EmailVerificationButtonProps) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trpc = useTRPC()

  const { mutate: sendVerification, isPending } = useMutation(
    trpc.users.sendVerificationEmail.mutationOptions(),
  )

  const handleClick = () => {
    setError(null)
    sendVerification(undefined, {
      onSuccess: () => {
        setSent(true)
        setTimeout(() => setSent(false), 5000)
      },
      onError: (err) => {
        setError(err.message || 'Failed to send verification email')
        setTimeout(() => setError(null), 5000)
      },
    })
  }

  if (sent) {
    return (
      <span className="text-xs text-green-600">Verification email sent!</span>
    )
  }

  if (error) {
    return <span className="text-xs text-destructive">{error}</span>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="h-7 text-xs"
    >
      <Mail className="h-3 w-3 mr-1" />
      {isPending ? 'Sending...' : 'Resend'}
    </Button>
  )
}
