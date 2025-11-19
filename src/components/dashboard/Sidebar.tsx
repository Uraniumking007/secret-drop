import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Lock,
  Settings,
  Users,
  User,
  Shield,
} from 'lucide-react'
import {
  Sidebar as SidebarRoot,
  SidebarBody,
  DesktopSidebar,
  MobileSidebar,
  useSidebar,
} from '@/components/ui/sidebar'
import { OrgSwitcher } from './OrgSwitcher'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from '@/lib/auth-client'

type SidebarSectionConfig = {
  title: string
  links: SidebarLinkConfig[]
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

const navSections: SidebarSectionConfig[] = [
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
    <SidebarRoot animate={false}>
      <SidebarBody className="w-full text-sidebar-foreground">
        <DesktopSidebar className="border-r border-white/15 bg-linear-to-b from-sidebar via-sidebar/80 to-background/60 text-white backdrop-blur-xl md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto">
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
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sidebar">
        <Shield className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-[0.4em] text-white/70">
          SecretDrop
        </span>
        <span className="text-lg font-bold">Acet Labs</span>
      </div>
    </div>
  )
}

function SidebarOrgSwitcher() {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-3 shadow-[0_15px_45px_rgba(10,10,10,0.65)]">
      <OrgSwitcher className="bg-transparent text-foreground" />
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
  return (
    <div className="space-y-3">
      <p className="px-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
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
  childrenLinks?: SidebarChildLink[]
  isMobile?: boolean
}) {
  const { setOpen } = useSidebar()
  const isActive = matchPath(pathname, to)

  return (
    <div className="space-y-1.5">
      <Link
        to={to}
        preload="intent"
        className={cn(
          'group flex items-center gap-3 rounded-3xl border px-3 py-3 transition-all duration-300',
          isActive
            ? 'border-white/40 bg-white/15 text-white shadow-lg shadow-white/10'
            : 'border-white/5 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white',
        )}
        onClick={() => {
          if (isMobile) {
            setOpen(false)
          }
        }}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition group-hover:bg-white/20',
            isActive && 'bg-white text-sidebar',
          )}
        >
          <Icon className={cn('h-4 w-4', isActive && 'text-sidebar')} />
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold leading-tight">{label}</span>
          <span className="text-xs text-white/60">
            {childrenLinks?.length
              ? 'Quick actions available'
              : 'Navigate to section'}
          </span>
        </div>
      </Link>
      {childrenLinks && childrenLinks.length > 0 && (
        <div className="space-y-1 pl-12">
          {childrenLinks.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              preload="intent"
              className={cn(
                'flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors',
                matchPath(pathname, child.to)
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              )}
              onClick={() => {
                if (isMobile) {
                  setOpen(false)
                }
              }}
            >
              {child.label}
              <span className="text-xs text-white/50">↗</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarUserCard({ name, email }: { name: string; email: string }) {
  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-white/30">
          <AvatarFallback className="bg-white/30 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col text-sm">
          <span className="font-semibold text-white">{name}</span>
          <span className="text-xs text-white/70">{email}</span>
        </div>
      </div>
      <div className="mt-4 gap-2 text-xs text-white/70">
        <Link
          to="/dashboard/profile"
          className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-medium text-white hover:bg-white/30"
        >
          <User className="h-3.5 w-3.5" />
          View profile
        </Link>
      </div>
    </div>
  )
}

function buildSectionsWithChildren(pathname: string): Array<
  SidebarSectionConfig & {
    links: Array<SidebarLinkConfig & { childrenLinks?: SidebarChildLink[] }>
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
): SidebarChildLink[] | undefined {
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
      { label: 'API Tokens', to: '/dashboard/settings/api-tokens' },
      { label: 'Organizations', to: '/dashboard/settings/organization' },
    ]
  }

  return undefined
}

function matchPath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`)
}
