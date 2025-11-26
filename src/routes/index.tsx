import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/integrations/trpc/react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { Hero } from '@/components/landing/Hero'
import { Pipeline } from '@/components/landing/Pipeline'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { WallOfEntropy } from '@/components/landing/WallOfEntropy'
import { Footer } from '@/components/landing/Footer'

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
      <div className="min-h-screen flex items-center justify-center bg-[#0f1216] text-[#e6e9ee]">
        <div className="text-center">
          <p className="text-lg animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1216] text-[#e6e9ee] font-sans selection:bg-[#4c89b6] selection:text-white overflow-x-hidden">
      <LandingHeader />
      <main>
        <Hero />
        <Pipeline />
        <FeatureGrid />
        <WallOfEntropy />
      </main>
      <Footer />
    </div>
  )
}
