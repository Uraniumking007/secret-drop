import { useState, useCallback } from "react";

export interface ModalState {
  isNewDropModalOpen: boolean;
  editModalOpen: boolean;
  deleteOpen: boolean;
  deleteId: string | null;
}

export function useModalState() {
  const [isNewDropModalOpen, setIsNewDropModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNewDropModal = useCallback(() => {
    setIsNewDropModalOpen(true);
  }, []);

  const closeNewDropModal = useCallback(() => {
    setIsNewDropModalOpen(false);
  }, []);

  const openEditModal = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
  }, []);

  const openDeleteModal = useCallback((id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteOpen(false);
    setDeleteId(null);
  }, []);

  return {
    // State
    isNewDropModalOpen,
    editModalOpen,
    deleteOpen,
    deleteId,

    // Actions
    openNewDropModal,
    closeNewDropModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
}
