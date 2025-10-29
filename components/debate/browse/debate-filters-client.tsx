"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DebateFilters } from "./debate-filters";

interface DebateFiltersClientProps {
  initialStatus: string;
  initialSearch: string;
}

export function DebateFiltersClient({
  initialStatus,
  initialSearch,
}: DebateFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const updateFilters = useCallback(
    (updates: { status?: string; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) return;

        if (key === "status") {
          value === "ALL"
            ? params.delete("status")
            : params.set("status", value);
        } else if (key === "search") {
          value.trim() === ""
            ? params.delete("search")
            : params.set("search", value.trim());
        }
      });

      startTransition(() => {
        router.push(`/debates?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const debouncedUpdateSearch = useDebouncedCallback((value: string) => {
    updateFilters({ search: value });
  }, 300);

  const handlers = useMemo(
    () => ({
      onStatusChange: (status: string) => updateFilters({ status }),
      onSearchChange: (value: string) => {
        setSearchTerm(value);
        debouncedUpdateSearch(value);
      },
    }),
    [updateFilters, debouncedUpdateSearch],
  );

  return (
    <div className="relative">
      <DebateFilters
        status={initialStatus}
        search={searchTerm}
        onStatusChange={handlers.onStatusChange}
        onSearchChange={handlers.onSearchChange}
      />

      {isPending && (
        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
