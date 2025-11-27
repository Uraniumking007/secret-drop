import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Shield } from 'lucide-react'
import { signIn, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LandingHeader } from '@/components/landing/LandingHeader'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to sign in')
      } else {
        navigate({ to: '/' })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
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
            Welcome back
          </h1>
          <p className="text-[#9aa4b2]">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="bg-[#141921]/80 backdrop-blur-xl border-[#2a3241] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-[#e6e9ee]">Sign In</CardTitle>
            <CardDescription className="text-[#9aa4b2]">
              Use your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#e6e9ee]">Password</Label>
                  <Link
                    to="/auth/signup"
                    className="text-xs text-[#4c89b6] hover:text-[#5a9bc8] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0f1216] border-[#2a3241] text-[#e6e9ee] placeholder:text-[#4b5563] focus:border-[#4c89b6] focus:ring-[#4c89b6]/20"
                />
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[#2a3241] p-6">
            <div className="text-sm text-[#9aa4b2]">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-[#4c89b6] hover:underline hover:text-[#5a9bc8] transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
