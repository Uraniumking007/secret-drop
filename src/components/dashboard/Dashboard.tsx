import { useState, useMemo } from "react";
import { ActionBar } from "./ActionBar";
import { SecretCard, type Secret } from "./SecretCard";
import { EmptyState } from "./EmptyState";
import { NewSecretModal, type NewSecretData } from "./NewSecretModal";
import {
  DetailPane,
  type SecretDetailMeta,
  type SecretViewItem,
} from "./DetailPane";

// Mock data for demonstration - replace with actual API calls
const MOCK_SECRETS: Secret[] = [
  {
    id: "1",
    name: "Staging Database Credentials",
    createdAt: "2024-01-15T10:30:00Z",
    status: "active",
    viewCount: 2,
    viewLimit: 5,
    hasPassword: true,
    expiresAt: "2024-02-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Production API Keys",
    createdAt: "2024-01-10T14:20:00Z",
    status: "active",
    viewCount: 1,
    viewLimit: null,
    hasPassword: false,
    expiresAt: "2024-01-17T14:20:00Z",
  },
  {
    id: "3",
    name: "Third-party Service Tokens",
    createdAt: "2024-01-05T09:15:00Z",
    status: "expired",
    viewCount: 3,
    viewLimit: 3,
    hasPassword: true,
    expiresAt: "2024-01-12T09:15:00Z",
  },
  {
    id: "4",
    name: "Development Environment Variables",
    createdAt: "2024-01-01T16:45:00Z",
    status: "viewed",
    viewCount: 1,
    viewLimit: 1,
    hasPassword: false,
  },
];

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDropModalOpen, setIsNewDropModalOpen] = useState(false);
  const [secrets, setSecrets] = useState<Secret[]>(MOCK_SECRETS);
  const [selectedSecret, setSelectedSecret] = useState<SecretDetailMeta | null>(
    null
  );
  const [selectedViews, setSelectedViews] = useState<SecretViewItem[]>([]);

  // Filter secrets based on search query
  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secrets;

    const query = searchQuery.toLowerCase();
    return secrets.filter(
      (secret) =>
        secret.name.toLowerCase().includes(query) ||
        secret.id.toLowerCase().includes(query)
    );
  }, [secrets, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewDrop = () => {
    setIsNewDropModalOpen(true);
  };

  const handleCreateSecret = async (data: NewSecretData) => {
    // TODO: Replace with actual API call
    const newSecret: Secret = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || "Untitled Secret",
      createdAt: new Date().toISOString(),
      status: "active",
      viewCount: 0,
      viewLimit: null, // View limits are now tracked in secretView table
      hasPassword: !!data.variablesPassword,
      expiresAt: data.expiresAt,
    };

    setSecrets((prev) => [newSecret, ...prev]);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleCopyLink = async (id: string) => {
    // TODO: Replace with actual API call to get shareable link
    const link = `${window.location.origin}/secret/${id}`;
    await navigator.clipboard.writeText(link);
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log("Edit secret:", id);
  };

  const handleDelete = (id: string) => {
    // TODO: Add confirmation modal
    if (
      confirm(
        "Are you sure you want to delete this secret? This action cannot be undone."
      )
    ) {
      setSecrets((prev) => prev.filter((secret) => secret.id !== id));
    }
  };

  const handleSelectSecret = (secret: Secret) => {
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
      <ActionBar
        context="personal"
        onSearch={handleSearch}
        onNewDrop={handleNewDrop}
        searchQuery={searchQuery}
      />

      <div className="mt-6">
        {filteredSecrets.length === 0 ? (
          <EmptyState onNewDrop={handleNewDrop} />
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filteredSecrets.length === secrets.length
                ? `${secrets.length} secret${secrets.length !== 1 ? "s" : ""}`
                : `${filteredSecrets.length} of ${secrets.length} secrets`}
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

      <DetailPane
        open={!!selectedSecret}
        secret={selectedSecret}
        views={selectedViews}
        onClose={handleCloseDetail}
      />

      <NewSecretModal
        isOpen={isNewDropModalOpen}
        onClose={() => setIsNewDropModalOpen(false)}
        onSubmit={handleCreateSecret}
      />
    </div>
  );
}
