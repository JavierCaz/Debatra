import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDebateById } from "@/app/actions/debates";
import { ArgumentsList } from "@/components/debate/argument-list";
import { DebateMetadata } from "@/components/debate/debate-metadata";
import { Button } from "@/components/ui/button";
import {
  calculateDebateProgress,
  groupArgumentsByTurn,
} from "@/lib/debate/stats";

interface DebateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DebateDetailPage({
  params,
}: DebateDetailPageProps) {
  const { id } = await params;
  const debate = await getDebateById(id);

  if (!debate) {
    notFound();
  }

  // Calculate all data once in the parent
  const { currentTurn, debateProgress, totalPossibleTurns } =
    calculateDebateProgress(debate);
  const argumentsByTurn = groupArgumentsByTurn(debate);
  const turnNumbers = Object.keys(argumentsByTurn)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/debates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Debates
          </Button>
        </Link>
      </div>

      {/* Horizontal Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Metadata - Compact Sidebar */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <DebateMetadata
            debate={debate}
            currentTurn={currentTurn}
            debateProgress={debateProgress}
            totalPossibleTurns={totalPossibleTurns}
          />
        </div>

        {/* Arguments - Main Content */}
        <div className="flex-1 min-w-0">
          <ArgumentsList
            argumentsByTurn={argumentsByTurn}
            turnNumbers={turnNumbers}
          />
        </div>
      </div>
    </div>
  );
}
