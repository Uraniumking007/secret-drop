import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export function LandingHeader() {
  const { data: session } = useSession()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border group-hover:border-primary transition-colors">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
            SecretDrop
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Security', 'Pricing', 'Blog'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg border border-border transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden md:block text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_30px_var(--color-primary)] transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
