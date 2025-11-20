import { Link, Outlet } from '@tanstack/react-router'
import { Key, Shield, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/dashboard/settings/profile',
    icon: User,
  },
  {
    title: 'Security',
    href: '/dashboard/settings',
    icon: Shield,
  },
  {
    title: 'Organization',
    href: '/dashboard/settings/organization',
    icon: Users,
  },
  {
    title: 'API Tokens',
    href: '/dashboard/settings/api-tokens',
    icon: Key,
  },
]

export function SettingsLayout() {
  return (
    <PageContainer maxWidth="md">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and security preferences.
        </p>
      </div>

      <Outlet />
    </PageContainer>
  )
}
