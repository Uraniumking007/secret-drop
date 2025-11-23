import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebarContent } from '@/components/dashboard/Sidebar'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

vi.mock('@/integrations/trpc/react', () => ({
  useTRPC: () => ({
    organizations: {
      list: {
        queryOptions: () => ({
          queryKey: ['organizations'],
          queryFn: async () => [
            { id: 'org_1', name: 'Acme Inc', tier: 'pro' },
            { id: 'org_2', name: 'Personal', tier: 'free' },
          ],
        }),
      },
    },
  }),
}))

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
      session: {
        activeOrgId: 'org_1',
      },
    },
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children: ReactNode
    [key: string]: unknown
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({
    pathname: '/dashboard',
  }),
  useNavigate: () => vi.fn(),
}))

const renderSidebar = ({
  open = true,
  animate = false,
}: {
  open?: boolean
  animate?: boolean
} = {}) => {
  const noop = () => { }

  return render(
    <QueryClientProvider client={queryClient}>
      <SidebarProvider open={open} setOpen={noop} animate={animate}>
        <DashboardSidebarContent />
      </SidebarProvider>
    </QueryClientProvider>,
  )
}

describe('Dashboard Sidebar', () => {
  it('renders navigation links and org switcher when expanded', async () => {
    renderSidebar()

    expect(screen.getAllByText('Dashboard')[0]).toBeVisible()
    expect(screen.getAllByText('Secrets')[0]).toBeVisible()
    expect(screen.getAllByText('Team')[0]).toBeVisible()

    // Wait for orgs to load
    await expect.poll(() => screen.queryByText('Acme Inc')).toBeInTheDocument()
  })

  it('shows session details in the user card', async () => {
    renderSidebar()

    await expect.poll(() => screen.getAllByText('Jane Doe')[0]).toBeVisible()
    expect(screen.getAllByText('jane@example.com')[0]).toBeVisible()
    expect(screen.getAllByText('View profile')[0]).toHaveAttribute(
      'href',
      '/dashboard/profile',
    )
  })

  it('hides navigation labels when collapsed with animation enabled', async () => {
    renderSidebar({ open: false, animate: true })

    await expect
      .poll(() => {
        const dashboards = screen.queryAllByText('Dashboard')
        return dashboards.every((el) => !el.checkVisibility())
      })
      .toBe(true)

    // Or better, use waitFor and expect
    await vi.waitFor(() => {
      screen.queryAllByText('Dashboard').forEach((el) => {
        expect(el).not.toBeVisible()
      })
      screen.queryAllByText('Secrets').forEach((el) => {
        expect(el).not.toBeVisible()
      })
      screen.queryAllByText('Team').forEach((el) => {
        expect(el).not.toBeVisible()
      })
    })
  })
})
