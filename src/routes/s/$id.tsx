import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/s/$id"!</div>
}
