import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfilePane } from "@/components/account/ProfilePane";
import { TabsNav, TabsSelect } from "@/components/account/TabsNav";
import { SecurityPane } from "@/components/account/SecurityPane";
import { BillingPane } from "@/components/account/BillingPane";
import { DangerPane } from "@/components/account/DangerPane";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const Route = createFileRoute("/user/settings")({
  component: AccountPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "profile",
  }),
});

type TabKey = "profile" | "security" | "billing" | "danger";

function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const search = useSearch({ from: "/user/settings" });

  if (!session && !isPending) {
    navigate({ to: "/" });
    return null;
  }

  if (isPending) {
    return <div>Loading...</div>;
  }

  const email = session?.user?.email;
  if (!email) {
    return <div>Loading...</div>;
  }
  return (
    <DashboardLayout organizations={[]}>
      <div className="mx-auto max-w-6xl pt-20 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="m-0 text-xl font-semibold">Account</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm hover:bg-accent/30">
                <Avatar>
                  <AvatarImage src={undefined} alt="avatar" />
                  <AvatarFallback>
                    {(email?.[0] || "?")?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block max-w-[160px] truncate text-muted-foreground">
                  {email || "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{email || "Signed out"}</DropdownMenuLabel>
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

        {/* Content Pane */}
        <section>
          {search.tab === "profile" ? <ProfilePane email={email} /> : null}
          {search.tab === "security" ? <SecurityPane email={email} /> : null}
          {search.tab === "billing" ? <BillingPane /> : null}
          {search.tab === "danger" ? <DangerPane email={email} /> : null}
        </section>
      </div>
    </DashboardLayout>
  );
}
