import { HomeLayout } from "@/components/layouts/home-layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import {
  ContextualDashboard,
  type WorkspaceContext,
} from "@/components/dashboard/ContextualDashboard";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { getUserOrgs } from "@/server/org/org";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = authClient.useSession();
  const { data: orgData, isLoading } = useQuery({
    queryKey: ["userOrgs"],
    queryFn: () => getUserOrgs(),
    enabled: !!session?.user?.email,
  });

  // If user is authenticated, show dashboard
  if (session?.user?.email) {
    if (isLoading) {
      return (
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div>Loading...</div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-background">
        <DashboardLayout organizations={orgData?.organizations || []}>
          {(workspaceContext: WorkspaceContext) => (
            <ContextualDashboard workspaceContext={workspaceContext} />
          )}
        </DashboardLayout>
      </main>
    );
  }

  // Otherwise show landing page
  const theme = {
    background: "#0f1216",
    panel: "#141921",
    panelBorder: "#1c232d",
    textPrimary: "#e6e9ee",
    textMuted: "#9aa4b2",
    accent: "#4c89b6",
    accentHover: "#5ea0d1",
    outline: "#314152",
    logoTint: "#6b7685",
    glow: "rgba(76, 137, 182, 0.3)",
  } as const;

  return (
    <main className="min-h-screen bg-[#0f1216] text-[#e6e9ee]">
      <HomeLayout>
        <Hero theme={theme} />
        <SocialProof theme={theme} />
        <FeatureGrid theme={theme} />
        <FinalCTA theme={theme} />
      </HomeLayout>
    </main>
  );
}

function HeroCardVisual({
  theme,
}: {
  theme: {
    panel: string;
    panelBorder: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
    glow: string;
  };
}) {
  return (
    <div
      aria-label="Secretdrop secure secret card"
      role="img"
      className="relative mx-auto w-[min(920px,92vw)] rounded-[16px] p-0.5 border"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.02), transparent)`,
        borderColor: theme.panelBorder,
      }}
    >
      <div
        className="rounded-[14px] p-4 sm:p-5"
        style={{
          background: theme.panel,
          boxShadow: `0 20px 60px -30px ${theme.glow}`,
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "#e25c62" }}
            />
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "#e7c36a" }}
            />
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "#5fb97a" }}
            />
            <span className="ml-2 text-xs" style={{ color: theme.textMuted }}>
              secrets.env
            </span>
          </div>
          <ShareIcon color={theme.textMuted} />
        </div>

        <div className="grid items-center gap-3 [grid-template-columns:1fr] sm:[grid-template-columns:220px_1fr]">
          <KeyValueRow label="API_KEY" redacted count={12} theme={theme} />
          <KeyValueRow label="DATABASE_URL" redacted count={24} theme={theme} />
          <KeyValueRow
            label="STRIPE_SECRET"
            redacted
            count={16}
            theme={theme}
          />
        </div>
      </div>

      <div className="absolute -top-2.5 -right-2.5">
        <div
          className="rounded-[14px] p-2.5"
          style={{
            background: `radial-gradient(600px 120px at 50% 50%, ${theme.glow}, transparent)`,
          }}
        >
          <LockBadge />
        </div>
      </div>
    </div>
  );
}

function KeyValueRow({
  label,
  redacted,
  count = 10,
  theme,
}: {
  label: string;
  redacted?: boolean;
  count?: number;
  theme: { textPrimary: string; textMuted: string; panelBorder: string };
}) {
  return (
    <>
      <div
        className="font-mono text-[14px] tracking-[0.3px]"
        style={{ color: theme.textMuted }}
      >
        {label}
      </div>
      <div
        className="flex min-h-10 items-center gap-2 rounded-[10px] bg-white/5 px-3 py-2 border"
        style={{ borderColor: theme.panelBorder }}
      >
        {redacted ? (
          <span aria-label="redacted secret value" className="tracking-[2px]">
            {"\u2022".repeat(count)}
          </span>
        ) : (
          <span style={{ color: theme.textPrimary }}>value</span>
        )}
      </div>
    </>
  );
}
function Hero({
  theme,
}: {
  theme: {
    background: string;
    panel: string;
    panelBorder: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    outline: string;
    logoTint: string;
    glow: string;
  };
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-6 px-5 pt-24 pb-16 text-center">
      <div className="mx-auto max-w-[900px]">
        <h1 className="m-0 text-4xl leading-tight tracking-[-0.02em] font-bold md:text-5xl">
          Drop Secrets Securely. Share with Confidence.
        </h1>
        <p className="mx-auto mt-4 max-w-[760px] text-[#9aa4b2] text-[18px] leading-[1.6]">
          Secretdrop is a simple, end-to-end encrypted platform for developers
          and teams. No more risk, just streamlined collaboration.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#get-started"
          className="rounded-[10px] bg-[#4c89b6] px-[18px] py-3 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(76,137,182,0.3)] border border-[#4c89b6] hover:bg-[#5ea0d1] hover:border-[#5ea0d1] transition-colors"
          onMouseOver={(e) => (
            (e.currentTarget.style.background = theme.accentHover),
            (e.currentTarget.style.borderColor = theme.accentHover)
          )}
          onMouseOut={(e) => (
            (e.currentTarget.style.background = theme.accent),
            (e.currentTarget.style.borderColor = theme.accent)
          )}
        >
          Get Started for Free
        </a>
        <a
          href="#docs"
          className="rounded-[10px] border border-[#314152] px-[18px] py-3 font-semibold text-white/95 no-underline"
        >
          View Docs
        </a>
      </div>

      <div className="mt-9 w-full">
        <HeroCardVisual theme={theme} />
      </div>
    </section>
  );
}

function SocialProof({
  theme,
}: {
  theme: { textMuted: string; logoTint: string };
}) {
  return (
    <section className="px-5 pt-6 pb-3">
      <p className="m-0 text-center text-[#9aa4b2]">
        Trusted by developers in growing teams.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 place-items-center">
        <Logo text="Atlas" color={theme.logoTint} />
        <Logo text="Nimbus" color={theme.logoTint} />
        <Logo text="Circuit" color={theme.logoTint} />
        <Logo text="Forge" color={theme.logoTint} />
        <Logo text="Prism" color={theme.logoTint} />
      </div>
    </section>
  );
}

function FeatureGrid({
  theme,
}: {
  theme: {
    textPrimary: string;
    textMuted: string;
    panel: string;
    panelBorder: string;
  };
}) {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-[1000px] text-center">
        <h2 className="m-0 text-[28px] tracking-[-0.01em]">
          Everything You Need for Secure Collaboration.
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<span style={{ fontSize: 22 }}>🔒</span>}
            title="End-to-End Encryption"
            body="Drop your secrets and generate a link. Data is encrypted in your browser and can only be decrypted by the recipient."
            theme={theme}
          />
          <FeatureCard
            icon={<span style={{ fontSize: 22 }}>⚙️</span>}
            title="Complete Access Control"
            body="Protect links with passwords, set expiration dates, or limit access by number of views. Revoke access at any time."
            theme={theme}
          />
          <FeatureCard
            icon={<span style={{ fontSize: 22 }}>🚀</span>}
            title="Built for Teams"
            body="Create a central, secure vault for your team's secrets. Onboard new developers in seconds, not hours."
            theme={theme}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  theme,
}: {
  icon: any;
  title: string;
  body: string;
  theme: {
    panel: string;
    panelBorder: string;
    textPrimary: string;
    textMuted: string;
  };
}) {
  return (
    <div className="h-full rounded-[14px] bg-[#141921] p-5 text-left border border-[#1c232d]">
      <div className="flex items-center gap-2.5">
        <div
          aria-hidden
          className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-white/5"
        >
          {icon}
        </div>
        <h3 className="m-0 text-[18px]">{title}</h3>
      </div>
      <p className="mt-2.5 text-[#9aa4b2] leading-[1.6]">{body}</p>
    </div>
  );
}

function FinalCTA({
  theme,
}: {
  theme: {
    accent: string;
    accentHover: string;
    textPrimary: string;
    outline: string;
  };
}) {
  return (
    <section id="get-started" className="px-5 pt-9 pb-20">
      <div className="mx-auto max-w-[900px] text-center">
        <h2 className="m-0 text-[32px] tracking-[-0.015em]">
          Ready to Stop Risking Your Secrets?
        </h2>
        <p className="mx-auto mt-3 max-w-[700px] text-[#9aa4b2]">
          Get started with Secretdrop for free. No credit card required.
        </p>
        <div className="mt-5">
          <a
            href="#"
            className="inline-block rounded-[12px] bg-[#4c89b6] px-[22px] py-[14px] font-bold text-white shadow-[0_10px_28px_-10px_rgba(76,137,182,0.3)] border border-[#4c89b6] hover:bg-[#5ea0d1] hover:border-[#5ea0d1] transition-colors"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </section>
  );
}

function ShareIcon({ color = "#9aa4b2" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 3 3z"
        fill={color}
        opacity="0.2"
      />
      <path
        d="M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-12a4 4 0 0 0-3.87 3H10a2 2 0 0 0-2 2v3h2v-3h4.13A4 4 0 1 0 18 2z"
        fill={color}
      />
      <path
        d="M18 10a4 4 0 0 0-3.87 3H10a2 2 0 0 0-2 2v3h2v-3h4.13A4 4 0 1 0 18 10z"
        fill={color}
        opacity="0.6"
      />
    </svg>
  );
}

function LockBadge() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="encrypted"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#17202a" stroke="#2a3847" />
      <path
        d="M8 11h8v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6z"
        fill="#4c89b6"
        filter="url(#glow)"
      />
      <path d="M9 9a3 3 0 1 1 6 0v2H9V9z" stroke="#4c89b6" strokeWidth="1.5" />
    </svg>
  );
}

function Logo({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ opacity: 0.8 }}>
      <svg width="100" height="28" viewBox="0 0 100 28" aria-hidden>
        <rect
          x="0"
          y="8"
          width="28"
          height="12"
          rx="3"
          fill={color}
          opacity="0.4"
        />
        <rect
          x="34"
          y="8"
          width="28"
          height="12"
          rx="3"
          fill={color}
          opacity="0.3"
        />
        <text
          x="68"
          y="18"
          fontFamily="sans-serif"
          fontSize="10"
          fill={color}
          opacity="0.8"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
