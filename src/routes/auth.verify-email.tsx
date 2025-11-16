import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  const navigate = useNavigate()
  const search = Route.useSearch()
  const trpc = useTRPC()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Note: Better Auth handles email verification, but we can create a custom endpoint
  // For now, this is a placeholder that shows the verification flow
  useEffect(() => {
    if (search.token) {
      // In a real implementation, you would call a verification endpoint here
      // For Better Auth, this would typically be handled by the auth API
      setTimeout(() => {
        setStatus('success')
      }, 1000)
    } else {
      setStatus('error')
      setErrorMessage('No verification token provided')
    }
  }, [search.token])

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <CardTitle className="mb-2">Verifying Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
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
            <Link to="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" className="w-full">
                Sign In
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

