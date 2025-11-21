import { createFileRoute } from '@tanstack/react-router'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings'

export const Route = createFileRoute('/dashboard/settings/security')({
  component: SecurityPage,
})

function SecurityPage() {
  return (
    <div className="space-y-6">
      <SecuritySettings />
      <TwoFactorSettings />
    </div>
  )
}
