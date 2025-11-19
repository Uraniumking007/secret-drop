import { createFileRoute } from '@tanstack/react-router'
import { ApiTokensSettings } from '@/components/settings/ApiTokensSettings'

export const Route = createFileRoute('/dashboard/settings/api-tokens')({
  component: DashboardApiTokensPage,
})

function DashboardApiTokensPage() {
  return <ApiTokensSettings />
}
