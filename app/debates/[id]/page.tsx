import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getDebateById } from "@/app/actions/debates";
import { DebateContentSection } from "@/components/debate/details/debate-content-section";
import { DebateInfo } from "@/components/debate/details/debate-info";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth/options";
import { calculateDebateProgress } from "@/lib/debate/stats";

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
  const session = await getServerSession(authOptions);

  if (!debate) {
    notFound();
  }

  const { currentTurn, debateProgress, totalPossibleTurns } =
    calculateDebateProgress(debate);

  const currentUserId = session?.user?.id;
  const isParticipant = debate.participants.some(
    (participant) => participant.userId === currentUserId,
  );

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
        {/* Single Combined Info Component */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <DebateInfo
            debate={debate}
            currentTurn={currentTurn}
            debateProgress={debateProgress}
            totalPossibleTurns={totalPossibleTurns}
          />
        </div>

        {/* Main Content with Arguments & Definitions */}
        <DebateContentSection
          debate={debate}
          currentUserId={currentUserId}
          isParticipant={isParticipant}
        />
      </div>
    </div>
  );
}
