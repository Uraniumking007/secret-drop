import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Building2, Clock, Lock, Shield, Users, Zap } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import { toast } from 'sonner'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const trpc = useTRPC()
  const { data: orgs } = useQuery({
    ...trpc.organizations.list.queryOptions(),
    enabled: !!session,
  })

  // Auto-create personal workspace if user is logged in and has no orgs
  const { mutate: createPersonalWorkspace } = useMutation(
    trpc.organizations.getOrCreatePersonal.mutationOptions(),
  )

  useEffect(() => {
    if (session && orgs && orgs.length === 0) {
      createPersonalWorkspace()
    }
  }, [session, orgs, createPersonalWorkspace])

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (session && orgs && orgs.length > 0) {
      toast(`Redirected from Home, Welcome! ${session.user.name}`)
      navigate({ to: '/dashboard' })
    }
  }, [session, orgs, navigate])

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      title: 'End-to-End Encryption',
      description:
        'AES-256 client-side encryption ensures your secrets are never exposed to our servers. Only you can decrypt them.',
    },
    {
      icon: <Clock className="w-12 h-12 text-cyan-400" />,
      title: 'Time-Based Expiration',
      description:
        'Set automatic expiration for your secrets. Choose from 1 hour to 30 days, or never expire.',
    },
    {
      icon: <Lock className="w-12 h-12 text-cyan-400" />,
      title: 'Password Protection',
      description:
        'Add an extra layer of security with password-protected secret links. Perfect for sharing sensitive data.',
    },
    {
      icon: <Users className="w-12 h-12 text-cyan-400" />,
      title: 'Team Collaboration',
      description:
        'Create organizations and teams to share secrets securely with your colleagues. Role-based access control included.',
    },
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Burn-on-Read',
      description:
        'Pro Team feature: Secrets can be automatically deleted after the first view for maximum security.',
    },
    {
      icon: <Building2 className="w-12 h-12 text-cyan-400" />,
      title: 'Enterprise Ready',
      description:
        'SSO, IP allowlisting, compliance logs, and more. Built for teams of all sizes, from solo developers to enterprises.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em] mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SecretDrop
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Secure Secret Management for Developers
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Store and share environment variables and secrets with end-to-end
            encryption. Built for individuals, teams, and enterprises.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              >
                Get Started Free
              </Button>
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              Free tier includes personal workspace, AES-256 encryption, and
              basic features
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
