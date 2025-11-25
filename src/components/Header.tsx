import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
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
import { OrgSwitcher } from './dashboard/OrgSwitcher'
import { signOut, useSession } from '@/lib/auth-client'

export default function Header() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    navigate({ to: '/' })
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center px-4 md:px-6">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="flex items-center gap-2 mr-6">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">
                SecretDrop
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                activeProps={{ className: 'text-foreground' }}
              >
                Home
              </Link>
              {session && (
                <Link
                  to="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  activeProps={{ className: 'text-foreground' }}
                >
                  Dashboard
                </Link>
              )}
              {/* Add more top-level links here if needed */}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Mobile Logo (Centered or Left next to burger) */}
          <div className="flex md:hidden flex-1 items-center gap-2 ml-2">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">SecretDrop</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search or other controls could go here */}
            </div>
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              {session ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:block">
                    <OrgSwitcher />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {session.user.name.charAt(0).toUpperCase() ||
                              session.user.email.charAt(0).toUpperCase() ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard/profile"
                          className="cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard/settings"
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">SecretDrop</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {session && (
                <div className="mb-4">
                  <OrgSwitcher />
                </div>
              )}

              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                >
                  Home
                </Link>
                {session && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/secrets"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                    >
                      <Shield className="h-5 w-5" />
                      Secrets
                    </Link>
                  </>
                )}
              </nav>

              {!session && (
                <div className="mt-8 flex flex-col gap-4">
                  <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
