import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Lock, Settings, Users } from 'lucide-react'
import { OrgSwitcher } from './OrgSwitcher'
import { cn } from '@/lib/utils'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const navSections = [
  {
    title: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/dashboard/secrets', label: 'Secrets', icon: Lock },
      { to: '/dashboard/teams', label: 'Team', icon: Users },
    ],
  },
  {
    title: 'Configuration',
    links: [{ to: '/dashboard/settings', label: 'Settings', icon: Settings }],
  },
]

const linkBaseClasses =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'

export function Sidebar({ className }: SidebarProps) {
  return (
    <div
      className={cn(
        'pb-12 w-full bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-3">
            <OrgSwitcher />
          </div>
          {navSections.map((section) => (
            <div key={section.title} className="mt-6 first:mt-0">
              <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={linkBaseClasses}
                    activeProps={{
                      className:
                        'bg-sidebar-accent text-sidebar-accent-foreground',
                    }}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
