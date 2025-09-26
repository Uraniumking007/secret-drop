import { Package, Plus } from "lucide-react";

interface EmptyStateProps {
  onNewDrop: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function EmptyState({
  onNewDrop,
  title = "Your dashboard is empty",
  description = "Create your first secure drop to get started. Share secrets safely with your team or collaborators.",
  buttonText = "Create Your First Drop",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 border border-border">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <button
          onClick={onNewDrop}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {buttonText}
        </button>
      </div>

      {/* Helpful tips */}
      <div className="mt-8 max-w-lg mx-auto">
        <div className="grid gap-4 sm:grid-cols-2 text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Secure by Default
              </h4>
              <p className="text-xs text-muted-foreground">
                All secrets are encrypted end-to-end before leaving your browser
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Control Access
              </h4>
              <p className="text-xs text-muted-foreground">
                Set passwords, expiration dates, and view limits for each secret
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
