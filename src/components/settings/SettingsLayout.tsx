import { Link, Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Shield, Key, User, Users } from 'lucide-react'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Security',
    href: '/settings',
    icon: Shield,
  },
  {
    title: 'Organization',
    href: '/dashboard/settings/organization',
    icon: Users,
  },
  {
    title: 'API Tokens',
    href: '/settings/api-tokens',
    icon: Key,
  },
]

export function SettingsLayout() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and security preferences.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                search={(prev: any) => prev}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start',
                )}
                activeProps={{
                  className: 'bg-accent text-accent-foreground',
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
