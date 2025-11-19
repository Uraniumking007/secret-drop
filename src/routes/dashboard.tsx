import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/dashboard/Sidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-muted/10">
      {/* Sidebar Wrapper: Sticky and Fixed Width */}
      <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
