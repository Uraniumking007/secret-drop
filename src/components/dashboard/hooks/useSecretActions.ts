import { useState, useCallback } from "react";
import {
  createSecret,
  deleteSecret,
  getSecretBySlugPublic,
  updateSecret,
} from "@/server/user/secrets";
import type { Secret as DbSecret } from "@/server/user/types/secrets";
import type { Secret as UISecret } from "../SecretCard";
import type { SecretDetailMeta, SecretViewItem } from "../DetailPane";
import type { NewSecretData } from "../NewSecretModal";
import type { EditSecretData } from "../EditSecretModal";
import type { MapDbSecretToUiSecret } from "../types";

// Utility function to map database secret to UI secret
export const mapDbSecretToUiSecret: MapDbSecretToUiSecret = (
  env: DbSecret
): UISecret => {
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
    description: env.description || "",
    isExpiring: env.isExpiring,
    isPublic: env.isPublic,
    deletedAt:
      env.deletedAt instanceof Date
        ? env.deletedAt.toISOString()
        : (env.deletedAt as unknown as string | null) || null,
    variablesHint: env.variablesHint || "",
    createdAt: createdAtIso,
    status: isExpired ? "expired" : "active",
    viewCount: 0,
    viewLimit: null,
    hasPassword: !!env.variablesPassword,
    expiresAt: expiresAtIso,
    ownerOrTeam: undefined,
    sparklinePoints: undefined,
  };
};

export function useSecretActions(initialSecrets: DbSecret[]) {
  const [secretsState, setSecretsState] = useState<UISecret[]>(
    (initialSecrets || []).map(mapDbSecretToUiSecret)
  );
  const [selectedSecret, setSelectedSecret] = useState<SecretDetailMeta | null>(
    null
  );
  const [selectedViews, setSelectedViews] = useState<SecretViewItem[]>([]);

  const handleCreateSecret = useCallback(async (data: NewSecretData) => {
    const secretData = {
      name: data.name || "Untitled Secret",
      description: data.description || "",
      variables: data.variables || "",
      isPublic: data.isPublic,
      variablesPassword: data.variablesPassword || null,
      variablesHint: data.variablesHint || "",
      expiresAt: data.expiresAt || null,
      isExpiring: data.isExpiring,
      deletedAt: null,
    };

    const formData = new FormData();
    Object.entries(secretData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const newSecret = await createSecret({ data: formData });
    setSecretsState((prev) => [
      mapDbSecretToUiSecret(newSecret.secret),
      ...prev,
    ]);
  }, []);

  const handleCopyLink = useCallback(async (slug: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/secret/${slug}`
    );
  }, []);

  const handleEdit = useCallback(async (slug: string) => {
    const formData = new FormData();
    formData.append("slug", slug);
    const { secret } = await getSecretBySlugPublic({ data: formData });

    setSelectedSecret({
      id: secret.id,
      name: secret.name,
      description: secret.description || "",
      isExpiring: secret.isExpiring,
      isPublic: secret.isPublic,
      variablesHint: secret.variablesHint || "",
      createdAt:
        secret.createdAt instanceof Date
          ? secret.createdAt.toISOString()
          : (secret.createdAt as unknown as string) || new Date().toISOString(),
      expiresAt:
        secret.expiresAt instanceof Date
          ? secret.expiresAt.toISOString()
          : (secret.expiresAt as unknown as string | null) || null,
      variablesPassword: secret.variablesPassword || undefined,
      variables: secret.variables || "",
    });

    return secret;
  }, []);

  const handleUpdateSecret = useCallback(
    async (data: EditSecretData) => {
      if (!selectedSecret) return;

      const formData = new FormData();
      formData.append("id", selectedSecret.id);
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      await updateSecret({ data: formData });

      // Update local state
      setSecretsState((prev) =>
        prev.map((secret) =>
          secret.id === selectedSecret.id
            ? {
                ...secret,
                name: data.name,
                description: data.description || "",
                isExpiring: data.isExpiring,
                isPublic: data.isPublic,
                variablesHint: data.variablesHint || "",
                variablesPassword: data.variablesPassword || null,
                hasPassword: !!data.variablesPassword,
                expiresAt: data.expiresAt || undefined,
              }
            : secret
        )
      );
    },
    [selectedSecret]
  );

  const handleDelete = useCallback(async (id: string) => {
    const formData = new FormData();
    formData.append("id", id);
    await deleteSecret({ data: formData });
    setSecretsState((prev) => prev.filter((secret) => secret.id !== id));
  }, []);

  const handleSelectSecret = useCallback((secret: UISecret) => {
    setSelectedSecret({
      id: secret.id,
      name: secret.name,
      description: secret.description || "",
      isExpiring: secret.isExpiring,
      isPublic: secret.isPublic,
      variablesHint: secret.variablesHint || "",
      createdAt: secret.createdAt,
      expiresAt: secret.expiresAt,
      variablesPassword: secret.hasPassword ? "yes" : "",
      variables: "", // Variables not available in UISecret, would need separate API call
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
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedSecret(null);
    setSelectedViews([]);
  }, []);

  return {
    secretsState,
    selectedSecret,
    selectedViews,
    setSecretsState,
    setSelectedSecret,
    handleCreateSecret,
    handleCopyLink,
    handleEdit,
    handleUpdateSecret,
    handleDelete,
    handleSelectSecret,
    handleCloseDetail,
  };
}
