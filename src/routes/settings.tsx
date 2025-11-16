import { createFileRoute, Link } from '@tanstack/react-router'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { ApiTokensSettings } from '@/components/settings/ApiTokensSettings'
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Key, User, Lock } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export const Route = createFileRoute('/settings')({
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
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Navigate to different settings sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
              </Link>
              <Link to="/settings/api-tokens">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  API Tokens
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <SecuritySettings />
        <TwoFactorSettings />
        <ApiTokensSettings />
      </div>
    </div>
  )
}
