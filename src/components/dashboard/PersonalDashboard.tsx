import { useState, useMemo } from "react";
import { ActionBar } from "./ActionBar";
import { SecretCard, type Secret as UISecret } from "./SecretCard";
import { EmptyState } from "./EmptyState";
import { NewDropModal, type NewDropData } from "./NewDropModal";
import {
  DetailPane,
  type SecretDetailMeta,
  type SecretViewItem,
} from "./DetailPane";
import type { Secret as DbSecret } from "@/server/user/types/secrets";
import {
  createSecret,
  deleteSecret,
  getSecret,
  getSecretBySlugPublic,
  getSecretLink,
  updateSecret,
} from "@/server/user/secrets";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

function mapDbSecretToUiSecret(env: DbSecret): UISecret {
  const createdAtIso =
    env.createdAt instanceof Date
      ? env.createdAt.toISOString()
      : typeof env.createdAt === "string"
        ? env.createdAt
        : new Date().toISOString();

  const expiresAtIso =
    env.expiresAt instanceof Date
      ? env.expiresAt.toISOString()
      : (env.expiresAt as unknown as string | undefined) || undefined;

  const isExpired = expiresAtIso
    ? new Date(expiresAtIso).getTime() < Date.now()
    : false;

  return {
    id: env.id,
    slug: env.slug,
    name: env.name || "Untitled Secret",
    createdAt: createdAtIso,
    status: isExpired ? "expired" : "active",
    viewCount: 0,
    viewLimit: null,
    hasPassword: !!env.variablesPassword,
    expiresAt: expiresAtIso,
    ownerOrTeam: undefined,
    sparklinePoints: undefined,
  };
}

export function PersonalDashboard({ secrets }: { secrets: DbSecret[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDropModalOpen, setIsNewDropModalOpen] = useState(false);
  const [secretsState, setSecretsState] = useState<UISecret[]>(
    (secrets || []).map(mapDbSecretToUiSecret)
  );
  const [selectedSecret, setSelectedSecret] = useState<SecretDetailMeta | null>(
    null
  );
  const [selectedViews, setSelectedViews] = useState<SecretViewItem[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter secrets based on search query
  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secretsState;

    const query = searchQuery.toLowerCase();
    return secretsState.filter(
      (secret) =>
        secret.name.toLowerCase().includes(query) ||
        secret.id.toLowerCase().includes(query)
    );
  }, [secretsState, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewDrop = () => {
    setIsNewDropModalOpen(true);
  };

  const handleCreateSecret = async (data: NewDropData) => {
    const secretData = {
      name: data.name || "Untitled Secret",
      description: data.description || "",
      variables: data.variables || "",
      isPublic: data.isPublic,
      variablesPassword: data.variablesPassword || undefined,
      variablesHint: data.variablesHint || "",
      expiresAt: data.expiresAt || null,
      isExpiring: data.isExpiring,
      deletedAt: null,
    };
    const formData = new FormData();
    Object.entries(secretData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const newSecret = await createSecret({
      data: formData,
    });

    setSecretsState((prev) => [
      mapDbSecretToUiSecret(newSecret.secret),
      ...prev,
    ]);
  };

  const handleCopyLink = async (slug: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/secret/${slug}`
    );
  };

  const handleEdit = async (slug: string) => {
    const { secret } = await getSecretBySlugPublic({ data: { slug } });
    setSelectedSecret({
      id: secret.id,
      name: secret.name,
      description: secret.description || "",
      createdAt:
        secret.createdAt instanceof Date
          ? secret.createdAt.toISOString()
          : (secret.createdAt as unknown as string) || new Date().toISOString(),
      expiresAt:
        secret.expiresAt instanceof Date
          ? secret.expiresAt.toISOString()
          : (secret.expiresAt as unknown as string | null) || undefined,
      variablesPassword: secret.variablesPassword || undefined,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteSecret({ data: { id: deleteId } });
    setSecretsState((prev) => prev.filter((secret) => secret.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleSelectSecret = (secret: UISecret) => {
    setSelectedSecret({
      id: secret.id,
      name: secret.name,
      description: "",
      createdAt: secret.createdAt,
      expiresAt: secret.expiresAt,
      variablesPassword: secret.hasPassword ? "yes" : undefined,
    });
    // Placeholder views; replace with API
    setSelectedViews([
      {
        id: "v1",
        userName: "Jane Doe",
        ipAddress: "203.0.113.10",
        userAgent: "Chrome on macOS",
        viewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "v2",
        userName: null,
        ipAddress: "198.51.100.24",
        userAgent: "curl/8.0",
        viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ]);
  };

  const handleCloseDetail = () => {
    setSelectedSecret(null);
    setSelectedViews([]);
  };

  return (
    <div>
      {/* Header */}
      <ActionBar
        context="personal"
        onSearch={handleSearch}
        onNewDrop={handleNewDrop}
        searchQuery={searchQuery}
      />

      <div className="mt-6">
        {filteredSecrets.length === 0 ? (
          <EmptyState
            onNewDrop={handleNewDrop}
            title="Create your first secure drop"
            description="Start sharing secrets securely with your team or collaborators."
            buttonText="Create New Drop"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filteredSecrets.length === secretsState.length
                ? `${secretsState.length} secret${secretsState.length !== 1 ? "s" : ""}`
                : `${filteredSecrets.length} of ${secretsState.length} secrets`}
            </div>
            <div className="grid gap-4">
              {filteredSecrets.map((secret) => (
                <div
                  key={secret.id}
                  onClick={() => handleSelectSecret(secret)}
                  className="cursor-pointer"
                >
                  <SecretCard
                    secret={secret}
                    onCopyLink={handleCopyLink}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* <DetailPane
        open={!!selectedSecret}
        secret={selectedSecret}
        views={selectedViews}
        onClose={handleCloseDetail}
      /> */}

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent open={editOpen} onClose={() => setEditOpen(false)}>
          <SheetHeader>
            <SheetTitle>Edit Secret</SheetTitle>
            <SheetDescription>Update details for your secret.</SheetDescription>
          </SheetHeader>
          {/* Placeholder for server-driven edit form */}
          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">Editing UI coming soon.</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      {deleteOpen && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete secret?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                secret.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <button
                className="px-3 py-2 rounded-md border border-border hover:bg-accent/40"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-md bg-destructive text-white hover:opacity-90"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <NewDropModal
        isOpen={isNewDropModalOpen}
        onClose={() => setIsNewDropModalOpen(false)}
        onSubmit={handleCreateSecret}
      />
    </div>
  );
}
