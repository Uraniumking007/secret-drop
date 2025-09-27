import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateSecret } from "@/server/user/secrets";
import type { SecretDetailMeta } from "./DetailPane";

export interface EditSecretData {
  name: string;
  description: string;
  variables: string;
  isPublic: boolean;
  variablesPassword?: string;
  variablesHint?: string;
  expiresAt?: string | null;
  isExpiring: boolean;
}

export interface EditSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditSecretData) => Promise<void>;
  secret: SecretDetailMeta | null;
}

export function EditSecretModal({
  isOpen,
  onClose,
  onSubmit,
  secret,
}: EditSecretModalProps) {
  const [formData, setFormData] = useState<EditSecretData>({
    name: "",
    description: "",
    variables: "",
    isPublic: false,
    variablesPassword: "",
    variablesHint: "",
    expiresAt: null,
    isExpiring: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when secret changes
  useEffect(() => {
    if (secret) {
      setFormData({
        name: secret.name || "",
        description: secret.description || "",
        variables: secret.variables || "", // Show the actual variables
        isPublic: secret.isPublic,
        variablesPassword: secret.variablesPassword || "",
        variablesHint: secret.variablesHint || "",
        expiresAt: secret.expiresAt || null,
        isExpiring: !!secret.expiresAt,
      });
    }
  }, [secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update secret:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isOpen || !secret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Edit Secret
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update your secret details
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter secret name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <label
              htmlFor="variables"
              className="text-sm font-medium text-foreground"
            >
              Variables
            </label>
            <textarea
              id="variables"
              name="variables"
              value={formData.variables}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none"
              placeholder="API_KEY=your_key_here&#10;DATABASE_URL=your_url_here"
            />
            <p className="text-xs text-muted-foreground">
              Enter your environment variables in KEY=VALUE format, one per line
            </p>
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <label
              htmlFor="variablesPassword"
              className="text-sm font-medium text-foreground"
            >
              Password Protection
            </label>
            <input
              id="variablesPassword"
              name="variablesPassword"
              type="password"
              value={formData.variablesPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional password to protect the secret"
            />
          </div>

          {/* Password Hint */}
          <div className="space-y-2">
            <label
              htmlFor="variablesHint"
              className="text-sm font-medium text-foreground"
            >
              Password Hint
            </label>
            <input
              id="variablesHint"
              name="variablesHint"
              type="text"
              value={formData.variablesHint}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional hint to help remember the password"
            />
          </div>

          {/* Public Access */}
          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary/50"
            />
            <label
              htmlFor="isPublic"
              className="text-sm font-medium text-foreground"
            >
              Make this secret publicly accessible
            </label>
          </div>

          {/* Expiration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="isExpiring"
                name="isExpiring"
                type="checkbox"
                checked={formData.isExpiring}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary/50"
              />
              <label
                htmlFor="isExpiring"
                className="text-sm font-medium text-foreground"
              >
                Set expiration date
              </label>
            </div>

            {formData.isExpiring && (
              <div className="space-y-2">
                <label
                  htmlFor="expiresAt"
                  className="text-sm font-medium text-foreground"
                >
                  Expires At
                </label>
                <input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Secret"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
