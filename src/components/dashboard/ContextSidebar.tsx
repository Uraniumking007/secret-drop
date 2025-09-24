import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  organizations: Organization[];
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
  const currentLabel = useMemo(() => {
    if (currentContextType === "personal") return "Personal Workspace";
    const org = organizations.find((o) => o.id === currentContextId);
    return org ? org.name : "Organization";
  }, [currentContextType, currentContextId, organizations]);

  return (
    <aside
      className={
        "h-full w-full max-w-[280px] shrink-0 border-r border-border bg-card/40 flex flex-col " +
        (className || "")
      }
    >
      <div className="p-4">
        {/* Context Switcher */}
        <label className="block text-xs text-muted-foreground mb-2">
          Context
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
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal Workspace</SelectItem>
            {organizations.map((o) => (
              <SelectItem key={o.id} value={`org:${o.id}`}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 flex-1">
        {currentContextType === "personal" ? (
          <div className="space-y-1">
            <SidebarLink label="Dashboard" />
            <SidebarLink label="Settings" />
          </div>
        ) : (
          <div className="space-y-1">
            <SidebarLink label="All Secrets" />
            <SidebarLink label="Teams" />
            <SidebarLink label="Members" />
            <SidebarLink label="Org Settings" />
          </div>
        )}
      </nav>

      {/* Footer: Avatar menu */}
      <div className="mt-auto p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full inline-flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 hover:bg-accent/40">
              <Avatar>
                <AvatarImage src={undefined} alt="avatar" />
                <AvatarFallback>
                  {(session?.user?.email?.[0] || "?")?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <div className="truncate text-sm text-foreground">
                  {session?.user?.email ?? "Account"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {currentLabel}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              {session?.user?.email ?? "Signed out"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings">Account Settings</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/billing">Billing</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/logout">Log Out</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function SidebarLink({ label }: { label: string }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 text-sm text-foreground border border-transparent hover:border-border transition-colors">
      {label}
    </button>
  );
}
