import { ActionBar } from "./ActionBar";
import { NewSecretModal } from "./NewSecretModal";
import { EditSecretModal } from "./EditSecretModal";
import { SecretList } from "./SecretList";
import { useSecretActions } from "./hooks/useSecretActions";
import { useModalState } from "./hooks/useModalState";
import { useSearch } from "./hooks/useSearch";
import type { Secret as DbSecret } from "@/server/user/types/secrets";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function PersonalDashboard({ secrets }: { secrets: DbSecret[] }) {
  // Custom hooks for state management
  const {
    secretsState,
    selectedSecret,
    selectedViews,
    handleCreateSecret,
    handleCopyLink,
    handleEdit,
    handleUpdateSecret,
    handleDelete,
    handleSelectSecret,
    handleCloseDetail,
  } = useSecretActions(secrets);

  const { searchQuery, filteredSecrets, handleSearch } =
    useSearch(secretsState);

  const {
    isNewDropModalOpen,
    editModalOpen,
    deleteOpen,
    deleteId,
    openNewDropModal,
    closeNewDropModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useModalState();

  // Enhanced handlers that integrate with modal state
  const handleNewDrop = () => {
    openNewDropModal();
  };

  const handleEditWithModal = async (slug: string) => {
    await handleEdit(slug);
    openEditModal();
  };

  const handleDeleteWithModal = (id: string) => {
    openDeleteModal(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await handleDelete(deleteId);
    closeDeleteModal();
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
        <SecretList
          secrets={filteredSecrets}
          onSelectSecret={handleSelectSecret}
          onCopyLink={handleCopyLink}
          onEdit={handleEditWithModal}
          onDelete={handleDeleteWithModal}
          totalSecrets={secretsState.length}
          onNewDrop={handleNewDrop}
        />
      </div>

      {/* <DetailPane
        open={!!selectedSecret}
        secret={selectedSecret}
        views={selectedViews}
        onClose={handleCloseDetail}
      /> */}

      {/* Edit Modal */}
      <EditSecretModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateSecret}
        secret={selectedSecret}
      />

      {/* Delete Confirm Dialog */}
      {deleteOpen && (
        <AlertDialog open={deleteOpen} onOpenChange={closeDeleteModal}>
          <AlertDialogContent open={deleteOpen} onClose={closeDeleteModal}>
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
                onClick={closeDeleteModal}
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

      <NewSecretModal
        isOpen={isNewDropModalOpen}
        onClose={closeNewDropModal}
        onSubmit={handleCreateSecret}
      />
    </div>
  );
}
