import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { Link, useLocation } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
import {
  Building2,
  User,
  Settings,
  Users,
  Shield,
  Plus,
  Home,
  BarChart3,
  UserCircle,
  CreditCard,
  AlertTriangle,
  Cog,
} from "lucide-react";

type WorkspaceContextType = "personal" | "organization";

export interface Organization {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
}

export interface ContextSidebarProps {
  currentContextType: WorkspaceContextType;
  currentContextId: string | null; // null when personal
  organizations: any[];
  onChangeContext: (next: {
    type: WorkspaceContextType;
    id: string | null;
  }) => void;
  className?: string;
}

export function ContextSidebar({
  currentContextType,
  currentContextId,
  organizations,
  onChangeContext,
  className,
}: ContextSidebarProps) {
  const { data: session } = authClient.useSession();
  const location = useLocation();

  const currentLabel = useMemo(() => {
    if (currentContextType === "personal") return "Personal Workspace";
    const org = organizations.find((o: any) => o.id === currentContextId);
    return org ? org.name : "Organization";
  }, [currentContextType, currentContextId, organizations]);

  const currentOrg = useMemo(() => {
    if (currentContextType === "organization") {
      return organizations.find((o: any) => o.id === currentContextId);
    }
    return null;
  }, [currentContextType, currentContextId, organizations]);

  // Detect if we're on settings pages
  const isOnUserSettings = location.pathname === "/user/settings";
  const isOnOrgSettings =
    location.pathname.startsWith("/orgs/") &&
    (location.pathname.includes("/user/settings") ||
      location.pathname.endsWith("/settings"));

  return (
    <aside
      className={
        "h-full w-full max-w-[300px] shrink-0 border-r border-border bg-card/40 flex flex-col " +
        (className || "")
      }
    >
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-border">
        <label className="block text-xs font-medium text-muted-foreground mb-3">
          Workspace
        </label>
        <Select
          value={
            currentContextType === "personal"
              ? "personal"
              : `org:${currentContextId ?? ""}`
          }
          onValueChange={(v) => {
            if (v === "personal") {
              onChangeContext({ type: "personal", id: null });
            } else if (v.startsWith("org:")) {
              onChangeContext({ type: "organization", id: v.split(":")[1] });
            }
          }}
        >
          <SelectTrigger className="w-full h-12 bg-background/50 border-border hover:bg-background/70">
            <div className="flex items-center gap-3">
              {currentContextType === "personal" ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4 text-primary" />
              )}
              <SelectValue placeholder="Select workspace" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <div>
                  <div className="font-medium">Personal Workspace</div>
                  <div className="text-xs text-muted-foreground">
                    {session?.user?.name || session?.user?.email}
                  </div>
                </div>
              </div>
            </SelectItem>
            {organizations.map((o: any) => (
              <SelectItem key={o.id} value={`org:${o.id}`}>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Organization
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
            <div className="px-2 py-1">
              <Link
                to="/orgs/new"
                className="w-full inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Organization
              </Link>
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {currentContextType === "personal" ? (
          <div className="space-y-1">
            <SidebarLink
              label="My Secrets"
              icon={<Home className="h-4 w-4" />}
              href="/user/secrets"
            />
            <SidebarLink
              label="Account Settings"
              icon={<Settings className="h-4 w-4" />}
              href="/user/settings"
            />

            {/* User Settings Sub-navigation */}
            {isOnUserSettings && (
              <div className="ml-6 space-y-1 mt-2">
                <SidebarSubLink
                  label="Profile"
                  icon={<UserCircle className="h-3 w-3" />}
                  href="/user/settings?tab=profile"
                />
                <SidebarSubLink
                  label="Security"
                  icon={<Shield className="h-3 w-3" />}
                  href="/user/settings?tab=security"
                />
                <SidebarSubLink
                  label="Billing"
                  icon={<CreditCard className="h-3 w-3" />}
                  href="/user/settings?tab=billing"
                />
                <SidebarSubLink
                  label="Danger Zone"
                  icon={<AlertTriangle className="h-3 w-3" />}
                  href="/user/settings?tab=danger"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <SidebarLink
              label="Org Dashboard"
              icon={<BarChart3 className="h-4 w-4" />}
              href="/"
            />
            <SidebarLink
              label="Teams"
              icon={<Users className="h-4 w-4" />}
              href={`/orgs/${currentContextId}/teams`}
            />
            <SidebarLink
              label="Members"
              icon={<User className="h-4 w-4" />}
              href={`/orgs/${currentContextId}/members`}
            />
            <SidebarLink
              label="Org Settings"
              icon={<Shield className="h-4 w-4" />}
              href={`/orgs/${currentContextId}`}
            />

            {/* Organization Settings Sub-navigation */}
            {isOnOrgSettings && currentContextId && (
              <div className="ml-6 space-y-1 mt-2">
                <SidebarSubLink
                  label="General"
                  icon={<Cog className="h-3 w-3" />}
                  href={`/orgs/${currentContextId}?tab=general`}
                />
                <SidebarSubLink
                  label="Members"
                  icon={<Users className="h-3 w-3" />}
                  href={`/orgs/${currentContextId}?tab=members`}
                />
                <SidebarSubLink
                  label="Teams"
                  icon={<Users className="h-3 w-3" />}
                  href={`/orgs/${currentContextId}?tab=teams`}
                />
                <SidebarSubLink
                  label="Billing"
                  icon={<CreditCard className="h-3 w-3" />}
                  href={`/orgs/${currentContextId}?tab=billing`}
                />
                <SidebarSubLink
                  label="Danger Zone"
                  icon={<AlertTriangle className="h-3 w-3" />}
                  href={`/orgs/${currentContextId}?tab=danger`}
                />
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile / Logout */}
      <div className="mt-auto p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full inline-flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-3 hover:bg-background/70 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt="avatar"
                />
                <AvatarFallback className="text-xs">
                  {(
                    session?.user?.name?.[0] ||
                    session?.user?.email?.[0] ||
                    "?"
                  )?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {session?.user?.name || session?.user?.email || "Account"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {session?.user?.email}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              {session?.user?.name || session?.user?.email || "Signed out"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/user/settings" search={{ tab: "profile" }}>
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/user/settings" search={{ tab: "billing" }}>
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/logout">Log Out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function SidebarLink({
  label,
  href,
  icon,
}: {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const classes =
    "w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/50 text-sm text-foreground border border-transparent hover:border-border transition-colors flex items-center gap-3";

  const content = (
    <>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <button className={classes}>{content}</button>;
}

function SidebarSubLink({
  label,
  href,
  icon,
}: {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const classes =
    "w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/30 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2";

  const content = (
    <>
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <button className={classes}>{content}</button>;
}
