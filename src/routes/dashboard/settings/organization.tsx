import { createFileRoute } from '@tanstack/react-router'
import { OrganizationSettings } from '@/components/settings/OrganizationSettings'

export const Route = createFileRoute('/dashboard/settings/organization')({
    component: OrganizationSettingsPage,
})

function OrganizationSettingsPage() {
    return <OrganizationSettings />
}
