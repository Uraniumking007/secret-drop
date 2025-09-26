import * as React from "react";

export function Sheet(
  props: React.PropsWithChildren<{
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }>
) {
  return <>{props.children}</>;
}

export function SheetTrigger(
  props: React.PropsWithChildren<{ asChild?: boolean; onClick?: () => void }>
) {
  return (
    <button onClick={props.onClick} className="hidden" aria-hidden>
      {props.children}
    </button>
  );
}

export function SheetContent(
  props: React.PropsWithChildren<{
    side?: "right" | "left";
    open?: boolean;
    onClose?: () => void;
  }>
) {
  const side = props.side || "right";
  return (
    <div
      className={`fixed inset-0 z-50 ${props.open ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity ${props.open ? "opacity-100" : "opacity-0"}`}
        onClick={props.onClose}
      />
      <div
        className={
          `absolute top-0 bottom-0 w-full max-w-[520px] border-l border-border bg-card shadow-2xl transition-transform ` +
          (side === "right" ? "right-0" : "left-0") +
          ` ${props.open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"}`
        }
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full overflow-auto p-5">{props.children}</div>
      </div>
    </div>
  );
}

export function SheetHeader({ children }: React.PropsWithChildren) {
  return <div className="mb-4">{children}</div>;
}

export function SheetTitle({ children }: React.PropsWithChildren) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function SheetDescription({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}
