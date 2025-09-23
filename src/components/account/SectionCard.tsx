import type { ReactNode } from "react";

export function SectionCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="m-0 text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
      {footer ? (
        <div className="border-t border-border px-4 py-3">{footer}</div>
      ) : null}
    </div>
  );
}
