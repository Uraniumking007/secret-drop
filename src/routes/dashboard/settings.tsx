import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SettingsLayout } from '@/components/settings/SettingsLayout'
import { useSession } from '@/lib/auth-client'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please sign in to view settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  )
}
