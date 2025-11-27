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
import { LandingHeader } from '@/components/landing/LandingHeader'

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1216] text-[#e6e9ee] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1c232d] via-[#0f1216] to-[#0f1216] z-0" />
      <LandingHeader />
      
      <div className="w-full max-w-md space-y-8 relative z-10 mt-20">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center rounded-2xl bg-[#1c232d] p-4 border border-[#2a3241] shadow-xl shadow-[#000000]/20">
            <Shield className="h-10 w-10 text-[#4c89b6]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e6e9ee] mt-4">
            Create an account
          </h1>
          <p className="text-[#9aa4b2]">
            Enter your information to get started
          </p>
        </div>

        <Card className="bg-[#141921]/80 backdrop-blur-xl border-[#2a3241] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-[#e6e9ee]">Sign Up</CardTitle>
            <CardDescription className="text-[#9aa4b2]">
              Create a new account to access all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#e6e9ee]">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6] focus:ring-[#4c89b6]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#e6e9ee]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6] focus:ring-[#4c89b6]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#e6e9ee]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className="bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6] focus:ring-[#4c89b6]/20"
                />
                <p className="text-xs text-[#9aa4b2]">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                  className="border-[#4c89b6] data-[state=checked]:bg-[#4c89b6] data-[state=checked]:text-white"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#9aa4b2]"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal(true)}
                    className="text-[#4c89b6] hover:underline cursor-pointer hover:text-[#5a9bc8] transition-colors"
                  >
                    terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal(true)}
                    className="text-[#4c89b6] hover:underline cursor-pointer hover:text-[#5a9bc8] transition-colors"
                  >
                    privacy policy
                  </button>
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#4c89b6] hover:bg-[#3d7299] text-white font-semibold shadow-[0_0_20px_rgba(76,137,182,0.3)] hover:shadow-[0_0_30px_rgba(76,137,182,0.5)] transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[#2a3241] p-6">
            <div className="text-sm text-[#9aa4b2]">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-[#4c89b6] hover:underline hover:text-[#5a9bc8] transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 bg-[#141921] border-[#2a3241] text-[#e6e9ee]">
          <DialogHeader className="p-6 pb-2 border-b border-[#2a3241]">
            <DialogTitle className="text-[#e6e9ee]">Terms of Service & Privacy Policy</DialogTitle>
            <DialogDescription className="text-[#9aa4b2]">
              Please read our Terms of Service and Privacy Policy carefully
              before creating an account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold mb-4 text-[#e6e9ee]">
                  Terms of Service
                </h3>
                <div className="text-[#9aa4b2]">
                  <LegalDocumentRenderer content={LEGAL_CONTENT.terms} />
                </div>
              </section>
              <div className="h-px bg-[#2a3241] my-8" />
              <section>
                <h3 className="text-lg font-semibold mb-4 text-[#e6e9ee]">
                  Privacy Policy
                </h3>
                <div className="text-[#9aa4b2]">
                  <LegalDocumentRenderer content={LEGAL_CONTENT.privacy} />
                </div>
              </section>
            </div>
          </div>
          <DialogFooter className="p-6 pt-2 border-t border-[#2a3241] mt-auto bg-[#141921]">
            <Button
              variant="outline"
              onClick={() => setShowLegalModal(false)}
              type="button"
              className="border-[#2a3241] text-[#e6e9ee] hover:bg-[#1c232d] hover:text-white"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAcceptTerms} 
              type="button"
              className="bg-[#4c89b6] hover:bg-[#3d7299] text-white"
            >
              I have read and agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
