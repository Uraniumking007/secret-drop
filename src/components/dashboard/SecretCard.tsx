import { useState } from "react";
import { Copy, MoreVertical, Eye, Calendar, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkline } from "./Sparkline";

export interface Secret {
  id: string;
  slug: string;
  name: string;
  description?: string;
  createdAt: string;
  status: "active" | "expired" | "viewed";
  viewCount: number;
  viewLimit: number | null; // null means unlimited
  hasPassword: boolean;
  expiresAt?: string | null;
  isExpiring: boolean;
  deletedAt?: string | null;
  variablesHint?: string;
  isPublic: boolean;
  ownerOrTeam?: string; // user.name or teams.name
  teamName?: string; // team name for organization context
  sparklinePoints?: number[]; // last 7 days views
}

interface SecretCardProps {
  secret: Secret;
  onCopyLink: (slug: string) => void;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
  showTeamInfo?: boolean;
}

export function SecretCard({
  secret,
  onCopyLink,
  onEdit,
  onDelete,
  showTeamInfo = false,
}: SecretCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await onCopyLink(secret.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: Secret["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "expired":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "viewed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getViewCountText = () => {
    if (secret.viewLimit === null) {
      return `Views: ${secret.viewCount} / ∞`;
    }
    return `Views: ${secret.viewCount} / ${secret.viewLimit}`;
  };

  const getExpiryText = () => {
    if (!secret.expiresAt) return null;
    const now = Date.now();
    const exp = new Date(secret.expiresAt).getTime();
    if (exp < now) return "Expired";
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return `Expires in ${days} day${days !== 1 ? "s" : ""}`;
  };
  console.log(secret);

  return (
    <div className="group rounded-xl bg-card border border-border p-4 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Secret info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">
              {secret.name || "Untitled Secret"}
            </h3>
            {secret.hasPassword && (
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          {showTeamInfo && secret.teamName && (
            <div className="text-xs text-muted-foreground mb-1 truncate">
              Team: {secret.teamName}
            </div>
          )}
          {!showTeamInfo && secret.ownerOrTeam && (
            <div className="text-xs text-muted-foreground mb-1 truncate">
              {secret.ownerOrTeam}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created {formatDate(secret.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>{getViewCountText()}</span>
              {secret.sparklinePoints && (
                <span className="ml-1 text-primary">
                  <Sparkline points={secret.sparklinePoints} />
                </span>
              )}
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                secret.status
              )}`}
            >
              {secret.status === "active" && "Active"}
              {secret.status === "expired" && "Expired"}
              {secret.status === "viewed" && "Viewed"}
            </span>
            {secret.expiresAt && (
              <span className="text-xs text-muted-foreground">
                {getExpiryText()}
              </span>
            )}
            {secret.deletedAt && (
              <span className="text-xs text-muted-foreground">Deleted</span>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors text-sm font-medium"
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>

          {/* More Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(secret.slug)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(secret.slug)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
