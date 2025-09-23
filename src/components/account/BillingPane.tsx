import { SectionCard } from "./SectionCard";

export function BillingPane() {
  return (
    <div className="space-y-4">
      <SectionCard title="Plan & Billing">
        <div className="text-sm">Current Plan: Free</div>
        <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-sm">Looking for team features?</div>
          <a
            href="#"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Upgrade to Pro
          </a>
        </div>
      </SectionCard>

      <SectionCard title="Payment Method">
        <p className="m-0 text-sm text-muted-foreground">
          No payment method on file.
        </p>
      </SectionCard>

      <SectionCard title="Billing History">
        <p className="m-0 text-sm text-muted-foreground">No invoices yet.</p>
      </SectionCard>
    </div>
  );
}
