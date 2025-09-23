type TabKey = string;

export function TabsNav({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: TabKey; label: string; danger?: boolean }[];
  value: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <nav className="hidden sm:block rounded-md border border-border bg-card p-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`w-full text-left rounded-md px-3 h-9 text-sm hover:bg-primary/10 ${
            value === t.key
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground"
          } ${t.danger ? "text-red-400 hover:bg-red-500/10" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function TabsSelect({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="mb-4 sm:hidden">
      <label className="sr-only" htmlFor="tab-select">
        Select Section
      </label>
      <select
        id="tab-select"
        className="w-full rounded-md border border-border bg-card px-3 h-10 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {tabs.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
