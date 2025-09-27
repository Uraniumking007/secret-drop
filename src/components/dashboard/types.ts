import type { Secret as DbSecret } from "@/server/user/types/secrets";
import type { Secret as UISecret } from "./SecretCard";
import type { SecretDetailMeta, SecretViewItem } from "./DetailPane";
import type { NewSecretData } from "./NewSecretModal";
import type { EditSecretData } from "./EditSecretModal";

// Dashboard state interfaces
export interface DashboardState {
  searchQuery: string;
  secrets: UISecret[];
  selectedSecret: SecretDetailMeta | null;
  selectedViews: SecretViewItem[];
}

// Modal state interfaces
export interface ModalState {
  isNewDropModalOpen: boolean;
  editModalOpen: boolean;
  deleteOpen: boolean;
  deleteId: string | null;
}

// Action handler interfaces
export interface SecretActions {
  onSearch: (query: string) => void;
  onNewDrop: () => void;
  onCreateSecret: (data: NewSecretData) => Promise<void>;
  onCopyLink: (slug: string) => Promise<void>;
  onEdit: (slug: string) => Promise<void>;
  onUpdateSecret: (data: EditSecretData) => Promise<void>;
  onDelete: (id: string) => void;
  onConfirmDelete: () => Promise<void>;
  onSelectSecret: (secret: UISecret) => void;
  onCloseDetail: () => void;
}

// Props interfaces
export interface PersonalDashboardProps {
  secrets: DbSecret[];
}

export interface SecretListProps {
  secrets: UISecret[];
  onSelectSecret: (secret: UISecret) => void;
  onCopyLink: (slug: string) => Promise<void>;
  onEdit: (slug: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export interface SecretListHeaderProps {
  totalSecrets: number;
  filteredCount: number;
}

// Utility function type
export type MapDbSecretToUiSecret = (env: DbSecret) => UISecret;
