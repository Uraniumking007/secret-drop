import { Link, useLocation } from '@tanstack/react-router'
import {
  Building2,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { OrgSwitcher } from './OrgSwitcher'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import {
  DesktopSidebar,
  MobileSidebar,
  SidebarBody,
  Sidebar as SidebarRoot,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from '@/lib/auth-client'

type SidebarSectionConfig = {
  title: string
  links: Array<SidebarLinkConfig>
}

type SidebarLinkConfig = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

type SidebarChildLink = {
  to: string
  label: string
}

const navSections: Array<SidebarSectionConfig> = [
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
] as const

export function Sidebar() {
  return (
    <SidebarRoot animate={true}>
      <SidebarBody className="w-full text-sidebar-foreground">
        <DesktopSidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:h-full md:overflow-y-auto">
          <SidebarContent />
        </DesktopSidebar>
        <MobileSidebar className="bg-sidebar text-sidebar-foreground">
          <SidebarContent isMobile />
        </MobileSidebar>
      </SidebarBody>
    </SidebarRoot>
  )
}

function SidebarContent({ isMobile = false }: { isMobile?: boolean } = {}) {
  const { data: session } = useSession()
  const location = useLocation()
  const pathname = location.pathname ?? '/dashboard'
  const computedSections = buildSectionsWithChildren(pathname)

  return (
    <div className="flex h-full flex-col justify-between gap-10">
      <div className="space-y-7">
        <SidebarBrand />
        <SidebarOrgSwitcher />
        <nav className="space-y-7">
          {computedSections.map((section) => (
            <SidebarSection key={section.title} title={section.title}>
              {section.links.map((link) => (
                <SidebarNavLink
                  key={link.to}
                  {...link}
                  pathname={pathname}
                  isMobile={isMobile}
                />
              ))}
            </SidebarSection>
          ))}
        </nav>
      </div>

      {session && (
        <SidebarUserCard
          name={session.user.name ?? session.user.email ?? 'User'}
          email={session.user.email ?? ''}
        />
      )}
    </div>
  )
}

export { SidebarContent as DashboardSidebarContent }

function SidebarBrand() {
  const { open, animate } = useSidebar()
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-4 py-3 text-sm font-semibold text-sidebar-foreground shadow-sm transition-all duration-300',
        !open && animate
          ? 'px-2 justify-center bg-transparent border-transparent shadow-none'
          : '',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Shield className="h-5 w-5" />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="flex flex-col leading-tight overflow-hidden whitespace-nowrap"
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            SecretDrop
          </span>
          <span className="text-lg font-bold">Acet Labs</span>
        </motion.div>
      )}
    </div>
  )
}

function SidebarOrgSwitcher() {
  const { open, setLocked } = useSidebar()
  return (
    <div
      className={cn(
        'rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-1 shadow-sm transition-all',
        !open && 'border-transparent bg-transparent shadow-none p-0',
      )}
    >
      <OrgSwitcher
        className={cn(
          'bg-transparent text-sidebar-foreground',
          !open && 'hidden',
        )}
        onOpenChange={setLocked}
      />
      {!open && (
        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { open } = useSidebar()
  return (
    <div className="space-y-2">
      {open && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
        >
          {title}
        </motion.p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  pathname,
  childrenLinks,
  isMobile = false,
}: {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  pathname: string
  childrenLinks?: Array<SidebarChildLink>
  isMobile?: boolean
}) {
  const { setOpen, open, animate } = useSidebar()
  const isActive = matchPath(pathname, to)

  return (
    <div className="space-y-1">
      <Link
        to={to}
        preload="intent"
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
          !open && animate ? 'justify-center px-2' : '',
        )}
        onClick={() => {
          if (isMobile) {
            setOpen(false)
          }
        }}
      >
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center transition-colors',
            isActive
              ? 'text-sidebar-primary'
              : 'text-muted-foreground group-hover:text-sidebar-foreground',
          )}
        >
          <Icon className={cn('h-5 w-5')} />
        </span>
        {open && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex flex-1 flex-col overflow-hidden whitespace-nowrap"
          >
            <span className="text-sm leading-tight">{label}</span>
          </motion.div>
        )}
      </Link>
      {open && childrenLinks && childrenLinks.length > 0 && (
        <div className="space-y-0.5 pl-10">
          {childrenLinks.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              preload="intent"
              className={cn(
                'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
                matchPath(pathname, child.to)
                  ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30',
              )}
              onClick={() => {
                if (isMobile) {
                  setOpen(false)
                }
              }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarUserCard({ name, email }: { name: string; email: string }) {
  const { open, animate } = useSidebar()
  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <div
      className={cn(
        'rounded-xl border border-sidebar-border bg-sidebar-accent/10 p-2 shadow-sm transition-all',
        !open && animate
          ? 'bg-transparent border-transparent shadow-none p-0 flex justify-center'
          : '',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3',
          !open && animate ? 'justify-center' : '',
        )}
      >
        <Avatar className="h-9 w-9 border border-sidebar-border">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        {open && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex flex-1 flex-col text-sm overflow-hidden"
          >
            <span className="font-semibold text-sidebar-foreground truncate">
              {name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {email}
            </span>
          </motion.div>
        )}
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3"
        >
          <Link
            to="/dashboard/profile"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-accent px-3 py-1.5 text-xs font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
          >
            <User className="h-3.5 w-3.5" />
            View profile
          </Link>
        </motion.div>
      )}
    </div>
  )
}

function buildSectionsWithChildren(pathname: string): Array<
  SidebarSectionConfig & {
    links: Array<SidebarLinkConfig & { childrenLinks?: Array<SidebarChildLink> }>
  }
> {
  return navSections.map((section) => ({
    ...section,
    links: section.links.map((link) => ({
      ...link,
      childrenLinks: computeChildLinks(link.to, pathname),
    })),
  }))
}

function computeChildLinks(
  linkTo: string,
  pathname: string,
): Array<SidebarChildLink> | undefined {
  if (
    linkTo.startsWith('/dashboard/secrets') &&
    pathname.startsWith('/dashboard/secrets')
  ) {
    return [
      { label: 'Secrets', to: '/dashboard/secrets' },
      { label: 'Create Secret', to: '/dashboard/secrets/create' },
    ]
  }

  if (
    linkTo.startsWith('/dashboard/settings') &&
    pathname.startsWith('/dashboard/settings')
  ) {
    return [
      { label: 'Profile', to: '/dashboard/settings/profile' },
      { label: 'Billing', to: '/dashboard/settings/billing' },
      { label: 'Security', to: '/dashboard/settings/security' },
      { label: 'API Tokens', to: '/dashboard/settings/api-tokens' },
      { label: 'Organizations', to: '/dashboard/settings/organization' },
    ]
  }

  return undefined
}

function matchPath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`)
}
