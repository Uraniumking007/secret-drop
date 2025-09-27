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
import { StatCards } from "./StatCards";
import { Plus } from "lucide-react";

// Mock data for organization secrets - replace with actual API calls
const MOCK_ORG_SECRETS: Secret[] = [
  {
    id: "1",
    name: "Production Database Credentials",
    createdAt: "2024-01-15T10:30:00Z",
    status: "active",
    viewCount: 2,
    viewLimit: 5,
    hasPassword: true,
    expiresAt: "2024-02-15T10:30:00Z",
    teamName: "Backend Team",
  },
  {
    id: "2",
    name: "API Gateway Keys",
    createdAt: "2024-01-10T14:20:00Z",
    status: "active",
    viewCount: 1,
    viewLimit: null,
    hasPassword: false,
    expiresAt: "2024-01-17T14:20:00Z",
    teamName: "DevOps Team",
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
    teamName: "Frontend Team",
  },
  {
    id: "4",
    name: "Staging Environment Variables",
    createdAt: "2024-01-01T16:45:00Z",
    status: "viewed",
    viewCount: 1,
    viewLimit: 1,
    hasPassword: false,
    teamName: "QA Team",
  },
];

export interface OrganizationDashboardProps {
  organization: {
    id: string;
    name: string;
  };
}

export function OrganizationDashboard({
  organization,
}: OrganizationDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDropModalOpen, setIsNewDropModalOpen] = useState(false);
  const [secrets, setSecrets] = useState<Secret[]>(MOCK_ORG_SECRETS);
  const [selectedSecret, setSelectedSecret] = useState<SecretDetailMeta | null>(
    null
  );
  const [selectedViews, setSelectedViews] = useState<SecretViewItem[]>([]);

  // Mock organization stats - replace with actual API calls
  const orgStats = {
    totalSecrets: secrets.length,
    totalTeams: 4, // Mock data
    totalMembers: 12, // Mock data
  };

  // Filter secrets based on search query
  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secrets;

    const query = searchQuery.toLowerCase();
    return secrets.filter(
      (secret) =>
        secret.name.toLowerCase().includes(query) ||
        secret.id.toLowerCase().includes(query) ||
        (secret.teamName && secret.teamName.toLowerCase().includes(query))
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
      viewLimit: null,
      hasPassword: !!data.variablesPassword,
      expiresAt: data.expiresAt,
      teamName: "Unassigned", // Default team
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {organization.name} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage organization secrets and teams
          </p>
        </div>
        <button
          onClick={handleNewDrop}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Drop
        </button>
      </div>

      {/* Stat Cards */}
      <StatCards
        totalSecrets={orgStats.totalSecrets}
        totalTeams={orgStats.totalTeams}
        totalMembers={orgStats.totalMembers}
      />

      <ActionBar
        context="organization"
        onSearch={handleSearch}
        onNewDrop={handleNewDrop}
        searchQuery={searchQuery}
      />

      <div className="mt-6">
        {filteredSecrets.length === 0 ? (
          <EmptyState
            onNewDrop={handleNewDrop}
            title="This organization has no secrets yet"
            description="Create the first drop to get started with secure secret sharing."
            buttonText="Create New Drop"
          />
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
                    showTeamInfo={true}
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
        orgContext={{
          organizationId: organization.id,
          teams: [],
        }}
      />
    </div>
  );
}
