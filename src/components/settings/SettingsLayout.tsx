import type { ReactNode } from 'react'
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

interface SettingsLayoutProps {
  children?: ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-4">
          <nav className="flex flex-col gap-2">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                preload="intent"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'justify-start font-medium',
                )}
                activeProps={{
                  className: cn(
                    buttonVariants({ variant: 'default', size: 'sm' }),
                    'justify-start shadow-sm',
                  ),
                }}
                inactiveProps={{
                  className: 'text-muted-foreground',
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children ?? <Outlet />}</div>
      </div>
    </PageContainer>
  )
}
