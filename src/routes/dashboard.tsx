import {
  Navigate,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useSession } from '@/lib/auth-client'
import { auth } from '@/lib/auth'
import { PageState } from '@/components/layout/PageState'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loaders'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { data: session, isPending, isRefetching, error } = useSession()
  const navigate = useNavigate()

  if (isPending || isRefetching) {
    return (
      <PageState
        title="Loading dashboard"
        description="Loading your dashboard..."
      >
        <Loader />
      </PageState>
    )
  }

  if (error) {
    return (
      <PageState
        title="Error loading dashboard"
        description="An error occurred while loading your dashboard."
      >
        <Loader />
        <Button
          onClick={() => {
            navigate({ to: '/' })
          }}
        >
          Go to home
        </Button>
      </PageState>
    )
  }

  if (!session) {
    return <Navigate to="/" />
  }

  return (
    <div className="flex h-screen w-full flex-col bg-muted/10 md:flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
