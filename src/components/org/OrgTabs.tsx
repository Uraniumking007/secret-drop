import { useMemo } from "react";

export const ORG_TABS = [
  "general",
  "members",
  "teams",
  "billing",
  "danger",
] as const;
export type OrgTab = (typeof ORG_TABS)[number];

export function OrgTabs({
  active,
  onChange,
}: {
  active: OrgTab;
  onChange: (t: OrgTab) => void;
}) {
  const items = useMemo(() => ORG_TABS, []);
  return (
    <div className="rounded-xl border border-border bg-card/40 p-2 h-fit">
      {items.slice(0, 4).map((t) => (
        <TabLink
          key={t}
          label={labelFor(t)}
          tab={t}
          active={active}
          onClick={onChange}
        />
      ))}
      <div className="my-2 h-px bg-border" />
      <TabLink
        label="Danger Zone"
        tab="danger"
        active={active}
        onClick={onChange}
        danger
      />
    </div>
  );
}

function labelFor(tab: OrgTab) {
  switch (tab) {
    case "general":
      return "General";
    case "members":
      return "Members";
    case "teams":
      return "Teams";
    case "billing":
      return "Billing";
    case "danger":
      return "Danger Zone";
  }
}

export function TabLink({
  label,
  tab,
  active,
  onClick,
  danger,
}: {
  label: string;
  tab: OrgTab;
  active: OrgTab;
  onClick: (t: OrgTab) => void;
  danger?: boolean;
}) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
        isActive
          ? "bg-primary/10 border-primary/30 text-foreground"
          : danger
            ? "border-border text-red-400/90 hover:bg-red-500/10"
            : "border-transparent hover:bg-accent/40"
      }`}
    >
      {label}
    </button>
  );
}
