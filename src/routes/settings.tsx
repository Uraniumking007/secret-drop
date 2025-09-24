import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { HomeLayout } from "@/components/layouts/home-layout";

export const Route = createFileRoute("/settings")({
  component: AccountPage,
});

type TabKey = "profile" | "security" | "billing" | "danger";

function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("profile");

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

  const tabs: { key: TabKey; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "security", label: "Security" },
    { key: "billing", label: "Billing" },
    { key: "danger", label: "Danger Zone" },
  ];

  return (
    <HomeLayout viewTitle="Account Settings" variant="app">
      <main className="min-h-screen bg-background text-foreground px-4">
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

          <TabsSelect
            tabs={tabs}
            value={tab}
            onChange={(key) => setTab(key as TabKey)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4">
            {/* Vertical tabs (desktop) */}
            <TabsNav
              tabs={tabs.map((t) => ({ ...t, danger: t.key === "danger" }))}
              value={tab}
              onChange={(key) => setTab(key as TabKey)}
            />

            {/* Content Pane */}
            <section>
              {tab === "profile" ? <ProfilePane email={email} /> : null}
              {tab === "security" ? <SecurityPane email={email} /> : null}
              {tab === "billing" ? <BillingPane /> : null}
              {tab === "danger" ? <DangerPane email={email} /> : null}
            </section>
          </div>
        </div>
      </main>
    </HomeLayout>
  );
}
