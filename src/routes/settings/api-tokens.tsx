import { createFileRoute } from '@tanstack/react-router'
import { ApiTokensSettings } from '@/components/settings/ApiTokensSettings'

export const Route = createFileRoute('/settings/api-tokens')({
  component: ApiTokensPage,
})

function ApiTokensPage() {
  return <ApiTokensSettings />
}
