import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export function LandingHeader() {
  const { data: session } = useSession()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#141921] border border-[#1c232d] group-hover:border-[#4c89b6] transition-colors">
            <Shield className="w-5 h-5 text-[#4c89b6]" />
          </div>
          <span className="font-bold text-xl text-[#e6e9ee] tracking-tight">
            SecretDrop
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Security', 'Pricing', 'Blog'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-gray-400 hover:text-[#4c89b6] transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-[#1c232d] hover:bg-[#252b36] text-[#e6e9ee] text-sm font-semibold rounded-lg border border-[#2a303b] transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden md:block text-sm font-semibold text-[#e6e9ee] hover:text-[#4c89b6] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="px-5 py-2.5 bg-[#4c89b6] hover:bg-[#3d7299] text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(76,137,182,0.3)] hover:shadow-[0_0_30px_rgba(76,137,182,0.5)] transition-all"
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
