import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Shield } from 'lucide-react'
import { signUp, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LEGAL_CONTENT } from '@/data/legal-content'
import { LegalDocumentRenderer } from '@/components/legal/LegalDocumentRenderer'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (session) {
    navigate({ to: '/' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!termsAccepted) {
      setError('You must accept the terms and privacy policy')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to sign up')
      } else {
        navigate({ to: '/' })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setShowLegalModal(true)
    } else {
      setTermsAccepted(false)
    }
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setShowLegalModal(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center rounded-full bg-background p-3">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create a new account to access all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal(true)}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal(true)}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    privacy policy
                  </button>
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
            <DialogDescription>
              Please read our Terms of Service and Privacy Policy carefully before
              creating an account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Terms of Service
                </h3>
                <LegalDocumentRenderer content={LEGAL_CONTENT.terms} />
              </section>
              <div className="h-px bg-border my-8" />
              <section>
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Privacy Policy
                </h3>
                <LegalDocumentRenderer content={LEGAL_CONTENT.privacy} />
              </section>
            </div>
          </div>
          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => setShowLegalModal(false)}
              type="button"
            >
              Decline
            </Button>
            <Button onClick={handleAcceptTerms} type="button">
              I have read and agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
