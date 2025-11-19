import { createFileRoute } from '@tanstack/react-router'
import { TeamsList } from '@/components/teams/TeamsList'

export const Route = createFileRoute('/dashboard/teams/')({
    component: TeamsPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            orgId: Number(search.orgId) || undefined,
        }
    },
})

function TeamsPage() {
    const search = Route.useSearch()
    return <TeamsList orgId={search.orgId} />
}
