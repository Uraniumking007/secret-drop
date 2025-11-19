import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SettingsLayout } from '@/components/settings/SettingsLayout'
import { useSession } from '@/lib/auth-client'
import { PageState } from '@/components/layout/PageState'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <PageState
        title="Sign in required"
        description="Please sign in to view settings."
      />
    )
  }

  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  )
}
