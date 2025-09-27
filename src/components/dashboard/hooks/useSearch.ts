import { useState, useMemo, useCallback } from "react";
import type { Secret as UISecret } from "../SecretCard";

export function useSearch(secrets: UISecret[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secrets;

    const query = searchQuery.toLowerCase();
    return secrets.filter(
      (secret) =>
        secret.name.toLowerCase().includes(query) ||
        secret.id.toLowerCase().includes(query)
    );
  }, [secrets, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    searchQuery,
    filteredSecrets,
    handleSearch,
  };
}
