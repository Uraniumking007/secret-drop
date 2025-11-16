import { Link, useNavigate } from '@tanstack/react-router'

import TanChatAIAssistant from './example-AIAssistant.tsx'
import { useSession, signOut } from '@/lib/auth-client'
import { ThemeToggle } from './ThemeToggle'
import { OrgSwitcher } from './OrgSwitcher'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ClipboardType,
  Database,
  Guitar,
  Home,
  Menu,
  MessagesSquare,
  Network,
  SquareFunction,
  StickyNote,
  Store,
  Table,
  X,
  LogOut,
  User,
  Shield,
  Settings,
  LayoutDashboard,
} from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [groupedExpanded, setGroupedExpanded] = useState<
    Record<string, boolean>
  >({})
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    navigate({ to: '/' })
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                SecretDrop
              </span>
            </Link>
            {session && (
              <div className="hidden md:block">
                <OrgSwitcher />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <>
                <Link to="/dashboard" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/secrets" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Secrets
                  </Button>
                </Link>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() ||
                            session.user.email?.charAt(0).toUpperCase() ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!session && (
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {session && (
            <div className="mb-4 md:hidden">
              <OrgSwitcher />
            </div>
          )}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>
          {session && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2',
                }}
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/secrets"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2',
                }}
              >
                <Shield size={20} />
                <span className="font-medium">Secrets</span>
              </Link>
            </>
          )}

          {/* Demo Links Start */}

          <Link
            to="/demo/start/server-funcs"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2',
            }}
          >
            <SquareFunction size={20} />
            <span className="font-medium">Start - Server Functions</span>
          </Link>

          <Link
            to="/demo/start/api-request"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Network size={20} />
            <span className="font-medium">Start - API Request</span>
          </Link>

          <div className="flex flex-row justify-between">
            <Link
              to="/demo/start/ssr"
              onClick={() => setIsOpen(false)}
              className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  'flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <StickyNote size={20} />
              <span className="font-medium">Start - SSR Demos</span>
            </Link>
            <button
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() =>
                setGroupedExpanded((prev) => ({
                  ...prev,
                  StartSSRDemo: !prev.StartSSRDemo,
                }))
              }
            >
              {groupedExpanded.StartSSRDemo ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>
          {groupedExpanded.StartSSRDemo && (
            <div className="flex flex-col ml-4">
              <Link
                to="/demo/start/ssr/spa-mode"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">SPA Mode</span>
              </Link>

              <Link
                to="/demo/start/ssr/full-ssr"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Full SSR</span>
              </Link>

              <Link
                to="/demo/start/ssr/data-only"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Data Only</span>
              </Link>
            </div>
          )}

          <Link
            to="/demo/drizzle"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Database size={20} />
            <span className="font-medium">Drizzle</span>
          </Link>

          <Link
            to="/demo/form/simple"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <ClipboardType size={20} />
            <span className="font-medium">Simple Form</span>
          </Link>

          <Link
            to="/demo/form/address"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <ClipboardType size={20} />
            <span className="font-medium">Address Form</span>
          </Link>

          <Link
            to="/demo/table"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Table size={20} />
            <span className="font-medium">TanStack Table</span>
          </Link>

          <Link
            to="/demo/trpc-todo"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Network size={20} />
            <span className="font-medium">tRPC Todo</span>
          </Link>

          <Link
            to="/demo/store"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Store size={20} />
            <span className="font-medium">Store</span>
          </Link>

          <Link
            to="/demo/tanchat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <MessagesSquare size={20} />
            <span className="font-medium">Chat</span>
          </Link>

          <Link
            to="/example/guitars"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Guitar size={20} />
            <span className="font-medium">Guitar Demo</span>
          </Link>

          <Link
            to="/demo/tanstack-query"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Network size={20} />
            <span className="font-medium">TanStack Query</span>
          </Link>

          {/* Demo Links End */}
        </nav>

        <div className="p-4 border-t flex flex-col gap-2">
          {session?.user ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase() ||
                      session.user.email?.charAt(0).toUpperCase() ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user.name || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/auth/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-primary-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <TanChatAIAssistant />
        </div>
      </aside>
    </>
  )
}
