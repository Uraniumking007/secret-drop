import { useMemo, useState } from "react";
import { X, Lock, Eye, Calendar, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSecretData) => void;
  // Optional org context for team assignment
  orgContext?: {
    organizationId: string;
    teams: { id: string; name: string }[];
  } | null;
}

export interface NewSecretData {
  name: string;
  description?: string;
  variables: string; // The actual secret content
  variablesPassword?: string; // Password protection
  variablesHint?: string; // Optional hint for password
  isPublic: boolean;
  expiresAt?: string | null; // ISO timestamp
  isExpiring: boolean;
  teamId?: string | null; // when in org context
}

const EXPIRATION_OPTIONS = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "never", label: "Never" },
];

export function NewSecretModal({
  isOpen,
  onClose,
  onSubmit,
  orgContext,
}: NewSecretModalProps) {
  const [formData, setFormData] = useState<NewSecretData>({
    name: "",
    description: "",
    variables: "",
    variablesPassword: "",
    variablesHint: "",
    isPublic: false,
    expiresAt: null,
    isExpiring: false,
    teamId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.variables.trim()) {
      newErrors.variables = "Secret content is required";
    }
    if (formData.variablesPassword && !formData.variablesPassword.trim()) {
      newErrors.variablesPassword =
        "Password is required when password protection is enabled";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Failed to create secret:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      variables: "",
      variablesPassword: "",
      variablesHint: "",
      isPublic: false,
      expiresAt: null,
      isExpiring: false,
      teamId: null,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof NewSecretData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Create Secure Drop
          </h2>
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Staging DB Credentials"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A friendly name to help you identify this secret
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of this secret"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Secret Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Secret Content *
            </label>
            <textarea
              value={formData.variables}
              onChange={(e) => handleInputChange("variables", e.target.value)}
              placeholder="Paste your .env file content, API keys, or any other secret text here..."
              rows={6}
              className="w-full px-3 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
            {errors.variables && (
              <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.variables}
              </div>
            )}
          </div>

          {/* Password Protection */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleInputChange(
                    "variablesPassword",
                    formData.variablesPassword ? "" : "temp"
                  )
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  formData.variablesPassword ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.variablesPassword
                      ? "translate-x-4"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Password Protection
                </span>
              </div>
            </div>

            {formData.variablesPassword && (
              <div className="space-y-3">
                <input
                  type="password"
                  value={formData.variablesPassword}
                  onChange={(e) =>
                    handleInputChange("variablesPassword", e.target.value)
                  }
                  placeholder="Enter password to protect this secret"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <input
                  type="text"
                  value={formData.variablesHint || ""}
                  onChange={(e) =>
                    handleInputChange("variablesHint", e.target.value)
                  }
                  placeholder="Optional hint for the password"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.variablesPassword && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.variablesPassword}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Expiration and Public Access */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Expires After
              </label>
              <Select
                value={formData.isExpiring ? "7d" : "never"}
                defaultValue="never"
                onValueChange={(value) => {
                  const isExpiring = value !== "never";
                  const expiresAt = isExpiring
                    ? new Date(
                        Date.now() + getExpirationMs(value)
                      ).toISOString()
                    : null;
                  handleInputChange("isExpiring", isExpiring);
                  handleInputChange("expiresAt", expiresAt);
                }}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Public Access */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Eye className="inline h-4 w-4 mr-1" />
                Public Access
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("isPublic", !formData.isPublic)
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    formData.isPublic ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isPublic ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {formData.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>

          {/* Team Assignment (org context only) */}
          {orgContext && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assign to Team
              </label>
              <Select
                value={formData.teamId ?? "none"}
                onValueChange={(value) =>
                  handleInputChange("teamId", value === "none" ? null : value)
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team (org-owned)</SelectItem>
                  {orgContext.teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This sets `environmentTeam` for this drop within the
                organization.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Secure Drop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to convert expiration string to milliseconds
function getExpirationMs(expiration: string): number {
  switch (expiration) {
    case "1h":
      return 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
  }
}
