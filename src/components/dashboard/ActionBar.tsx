import { useState } from "react";
import { Search, Plus } from "lucide-react";

interface ActionBarProps {
  context: "personal" | "organization";
  onSearch: (query: string) => void;
  onNewDrop: () => void;
  searchQuery: string;
}

export function ActionBar({
  context,
  onSearch,
  onNewDrop,
  searchQuery,
}: ActionBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side - Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {context === "personal" ? "My Secrets" : "Organization Secrets"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {context === "personal"
            ? "Manage and share your secure drops"
            : "Manage and share your organization's secure drops"}
        </p>
      </div>

      {/* Right side - Search and CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter secrets..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onNewDrop}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Drop
        </button>
      </div>
    </div>
  );
}
