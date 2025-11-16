import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

interface EmailVerificationButtonProps {
  email: string
}

export function EmailVerificationButton({ email }: EmailVerificationButtonProps) {
  const [sent, setSent] = useState(false)
  const trpc = useTRPC()

  const { mutate: sendVerification, isPending } = useMutation(
    trpc.users.sendVerificationEmail.mutationOptions()
  )

  const handleClick = () => {
    sendVerification(undefined, {
      onSuccess: () => {
        setSent(true)
        setTimeout(() => setSent(false), 5000)
      },
    })
  }

  if (sent) {
    return (
      <span className="text-xs text-green-600">Verification email sent!</span>
    )
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

