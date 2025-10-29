import { Plus } from "lucide-react";
import Link from "next/link";
import { getDebates } from "@/app/actions/debates";
import { DebateCard } from "@/components/debate/browse/debate-card";
import { DebateFiltersClient } from "@/components/debate/browse/debate-filters-client";
import { Button } from "@/components/ui/button";
import type { DebateStatus } from "@/types/debate";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function DebatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status || "ALL") as DebateStatus | "ALL";
  const search = params.search || "";

  const result = await getDebates({ status, search });

  // Create a unique key based on search params to force re-render when filters change
  const debatesKey = `${status}-${search}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Debates</h1>
          <p className="text-muted-foreground mt-2">
            Browse and participate in evidence-based debates
          </p>
        </div>
        <Link href="/debates/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Debate
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4">
            <DebateFiltersClient
              initialStatus={status}
              initialSearch={search}
            />
          </div>
        </aside>

        {/* Debates List */}
        <main className="lg:col-span-3">
          {!result.success ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load debates</p>
            </div>
          ) : !result.debates || result.debates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No debates found</p>
              {(status !== "ALL" || search) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              )}
            </div>
          ) : (
            <div key={debatesKey} className="space-y-4">
              {result.debates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
