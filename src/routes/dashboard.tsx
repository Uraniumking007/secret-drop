import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/dashboard/Sidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-muted/10 md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
