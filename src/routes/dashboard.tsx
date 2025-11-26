import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useSession } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { data: session } = useSession()

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
