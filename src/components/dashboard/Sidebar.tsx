import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
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
  useSidebar,
} from '@/components/ui/sidebar'
import { OrgSwitcher } from './OrgSwitcher'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from '@/lib/auth-client'

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

export function Sidebar() {
  return (
    <SidebarRoot>
      <SidebarBody className="bg-sidebar text-sidebar-foreground/90 border-border/40 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:border-r md:bg-sidebar/70">
        <SidebarContent />
      </SidebarBody>
    </SidebarRoot>
  )
}

function SidebarContent() {
  const { data: session } = useSession()

  return (
    <div className="flex h-full flex-col justify-between gap-8">
      <div className="space-y-6">
        <SidebarBrand />
        <SidebarOrgSwitcher />
        <nav className="space-y-6">
          {navSections.map((section) => (
            <SidebarSection key={section.title} title={section.title}>
              {section.links.map((link) => (
                <SidebarNavLink key={link.to} {...link} />
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sidebar">
        <Shield className="h-5 w-5" />
      </div>
      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'inline-flex' : 'none') : 'inline-flex',
        }}
        className="flex flex-col leading-tight"
      >
        <span className="text-xs uppercase tracking-wider text-white/70">
          SecretDrop
        </span>
        <span className="text-base font-bold">Acet Labs</span>
      </motion.span>
    </div>
  )
}

function SidebarOrgSwitcher() {
  const { open, animate } = useSidebar()

  return (
    <motion.div
      animate={{
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className="overflow-hidden transition-[margin-top]"
      style={{
        height: animate && !open ? 0 : 'auto',
        marginTop: animate && !open ? 0 : '0.75rem',
      }}
    >
      <OrgSwitcher className="bg-background" />
    </motion.div>
  )
}

function SidebarSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { open, animate } = useSidebar()

  return (
    <div className="space-y-2">
      <motion.p
        animate={{
          opacity: animate ? (open ? 0.6 : 0) : 0.6,
          display: animate ? (open ? 'block' : 'none') : 'block',
        }}
        className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
      >
        {title}
      </motion.p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}) {
  const { open, animate, setOpen } = useSidebar()

  return (
    <Link
      to={to}
      preload="intent"
      className={cn(
        'group/sidebar flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white',
      )}
      activeProps={{
        className:
          'group/sidebar flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white bg-white/15',
      }}
      onClick={() => setOpen(false)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'inline-flex' : 'none') : 'inline-flex',
        }}
        className="whitespace-pre text-sm"
      >
        {label}
      </motion.span>
    </Link>
  )
}

function SidebarUserCard({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const { open, animate, setOpen } = useSidebar()

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/20">
          <AvatarFallback className="bg-white/20 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <motion.div
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            display: animate ? (open ? 'flex' : 'none') : 'flex',
          }}
          className="flex flex-1 flex-col text-sm"
        >
          <span className="font-semibold text-white">{name}</span>
          <span className="text-xs text-white/70">{email}</span>
        </motion.div>
      </div>
      <motion.div
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'flex' : 'none') : 'flex',
        }}
        className="mt-3 gap-2 text-xs text-white/70"
      >
        <Link
          to="/dashboard/profile"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20"
        >
          <User className="h-3.5 w-3.5" />
          View profile
        </Link>
      </motion.div>
    </div>
  )
}
