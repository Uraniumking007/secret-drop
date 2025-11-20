import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebarContent } from '@/components/dashboard/Sidebar'

vi.mock('@/components/dashboard/OrgSwitcher', () => ({
  OrgSwitcher: () => <div data-testid="org-switcher" />,
}))

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Jane Doe',
        email: 'jane@example.com',
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
}))

const renderSidebar = ({
  open = true,
  animate = false,
}: {
  open?: boolean
  animate?: boolean
} = {}) => {
  const noop = () => {}

  return render(
    <SidebarProvider open={open} setOpen={noop} animate={animate}>
      <DashboardSidebarContent />
    </SidebarProvider>,
  )
}

describe('Dashboard Sidebar', () => {
  it('renders navigation links and org switcher when expanded', () => {
    renderSidebar()

    expect(screen.getByText('Dashboard')).toBeVisible()
    expect(screen.getByText('Secrets')).toBeVisible()
    expect(screen.getByText('Team')).toBeVisible()
    expect(screen.getByTestId('org-switcher')).toBeInTheDocument()
  })

  it('shows session details in the user card', () => {
    renderSidebar()

    expect(screen.getByText('Jane Doe')).toBeVisible()
    expect(screen.getByText('jane@example.com')).toBeVisible()
    expect(screen.getByText('View profile')).toHaveAttribute(
      'href',
      '/dashboard/profile',
    )
  })

  it('hides navigation labels when collapsed with animation enabled', () => {
    renderSidebar({ open: false, animate: true })

    expect(screen.getByText('Dashboard')).not.toBeVisible()
    expect(screen.getByText('Secrets')).not.toBeVisible()
    expect(screen.getByText('Team')).not.toBeVisible()
  })
})
