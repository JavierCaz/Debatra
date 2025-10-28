import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDebateById } from "@/app/actions/debates";
import { ArgumentsList } from "@/components/debate/arguments-list";
import { DebateMetadata } from "@/components/debate/debate-metadata";
import { Button } from "@/components/ui/button";

interface DebateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function calculateDebateProgress(debate: any) {
  const allTurnNumbers = debate.participants.flatMap((participant: any) =>
    participant.arguments.map((argument: any) => argument.turnNumber),
  );

  const currentTurn =
    allTurnNumbers.length > 0 ? Math.max(...allTurnNumbers) : 0;
  const totalPossibleTurns = debate.turnsPerSide * debate.maxParticipants;
  const debateProgress =
    totalPossibleTurns > 0 ? (currentTurn / totalPossibleTurns) * 100 : 0;

  return { currentTurn, debateProgress, totalPossibleTurns };
}

export default async function DebateDetailPage({
  params,
}: DebateDetailPageProps) {
  const { id } = await params;
  const debate = await getDebateById(id);

  if (!debate) {
    notFound();
  }

  const { currentTurn, debateProgress, totalPossibleTurns } =
    calculateDebateProgress(debate);

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
          {" "}
          {/* min-w-0 prevents flex overflow */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{debate.title}</h1>
            <p className="text-muted-foreground mt-2">{debate.description}</p>
          </div>
          <ArgumentsList
            debate={debate}
            currentTurn={currentTurn}
            totalPossibleTurns={totalPossibleTurns}
          />
        </div>
      </div>
    </div>
  );
}
