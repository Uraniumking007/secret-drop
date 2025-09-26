import * as React from "react";

export function AlertDialog(
  props: React.PropsWithChildren<{
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }>
) {
  return <>{props.children}</>;
}

export function AlertDialogTrigger(
  props: React.PropsWithChildren<{ asChild?: boolean; onClick?: () => void }>
) {
  return (
    <button onClick={props.onClick} className="hidden" aria-hidden>
      {props.children}
    </button>
  );
}

export function AlertDialogContent(
  props: React.PropsWithChildren<{ open?: boolean; onClose?: () => void }>
) {
  return (
    <div
      className={`fixed inset-0 z-50 ${props.open ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity ${props.open ? "opacity-100" : "opacity-0"}`}
        onClick={props.onClose}
      />
      <div
        className={`absolute left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl`}
      >
        <div className="p-5">{props.children}</div>
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }: React.PropsWithChildren) {
  return <div className="mb-3">{children}</div>;
}

export function AlertDialogTitle({ children }: React.PropsWithChildren) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function AlertDialogDescription({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}

export function AlertDialogFooter({ children }: React.PropsWithChildren) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2">{children}</div>
  );
}
