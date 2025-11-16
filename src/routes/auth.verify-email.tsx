import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/lib/auth-client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || undefined,
    }
  },
})

function VerifyEmailPage() {
  const search = Route.useSearch()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  )
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { mutate: verifyEmail } = useMutation(
    trpc.users.verifyEmail.mutationOptions(),
  )

  useEffect(() => {
    if (!search.token) {
      setStatus('error')
      setErrorMessage('No verification token provided')
      return
    }

    // Verify the email token (works without login)
    verifyEmail(
      { token: search.token },
      {
        onSuccess: () => {
          setStatus('success')
          // Invalidate profile query if user is logged in
          if (session) {
            queryClient.invalidateQueries({
              queryKey: ['trpc', 'users', 'getProfile'],
            })
          }
        },
        onError: (error) => {
          setStatus('error')
          setErrorMessage(error.message || 'Verification failed')
        },
      },
    )
  }, [search.token, verifyEmail, queryClient, session])

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <CardTitle className="mb-2">Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-center">Email Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email address has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/profile">
              <Button className="w-full">Go to Profile</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center">
            {errorMessage || 'The verification link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/auth/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Need help? Contact support or request a new verification email.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
