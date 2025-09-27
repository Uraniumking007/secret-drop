import { SecretCard } from "./SecretCard";
import { EmptyState } from "./EmptyState";
import type { SecretListProps, SecretListHeaderProps } from "./types";

function SecretListHeader({
  totalSecrets,
  filteredCount,
}: SecretListHeaderProps) {
  return (
    <div className="text-sm text-muted-foreground">
      {filteredCount === totalSecrets
        ? `${totalSecrets} secret${totalSecrets !== 1 ? "s" : ""}`
        : `${filteredCount} of ${totalSecrets} secrets`}
    </div>
  );
}

export interface SecretListWithEmptyStateProps extends SecretListProps {
  totalSecrets: number;
  onNewDrop: () => void;
}

export function SecretList({
  secrets,
  onSelectSecret,
  onCopyLink,
  onEdit,
  onDelete,
  totalSecrets,
  onNewDrop,
}: SecretListWithEmptyStateProps) {
  if (secrets.length === 0) {
    return (
      <EmptyState
        onNewDrop={onNewDrop}
        title="Create your first secure drop"
        description="Start sharing secrets securely with your team or collaborators."
        buttonText="Create New Drop"
      />
    );
  }

  return (
    <div className="space-y-4">
      <SecretListHeader
        totalSecrets={totalSecrets}
        filteredCount={secrets.length}
      />
      <div className="grid gap-4">
        {secrets.map((secret) => (
          <div
            key={secret.id}
            onClick={() => onSelectSecret(secret)}
            className="cursor-pointer"
          >
            <SecretCard
              secret={secret}
              onCopyLink={onCopyLink}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
