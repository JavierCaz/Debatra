import { CheckCircle, Clock, Edit, Users, XCircle } from "lucide-react";
import { T } from "@/components/ui/translated-text";
import type { ParticipantRole } from "@/types/debate";
import type { DebateRequestsPanelProps } from "@/types/debate-requests";

interface StatusSummaryProps {
  debate: DebateRequestsPanelProps["debate"];
  currentTurn: number;
  debateProgress: number;
  totalPossibleTurns: number;
}

export function StatusSummary({
  debate,
  currentTurn,
  debateProgress,
  totalPossibleTurns,
}: StatusSummaryProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DRAFT":
        return {
          icon: Edit,
          iconColor: "text-gray-600",
          titleColor: "text-gray-800",
          message: <T k="debate.status.draft" />,
          description: <T k="debate.status.draftDesc" />,
        };
      case "OPEN":
        return {
          icon: Users,
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          message: <T k="debate.status.open" />,
          description: <T k="debate.status.openDesc" />,
        };
      case "IN_PROGRESS":
        return {
          icon: Clock,
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          message: <T k="debate.status.inProgress" />,
          description: (
            <T
              k="debate.status.inProgressDesc"
              values={{ current: currentTurn, total: totalPossibleTurns }}
            />
          ),
        };
      case "COMPLETED":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          message: <T k="debate.status.completed" />,
          description: debate.winCondition ? (
            <T k={`debate.winConditionType.${debate.winCondition.type}`} />
          ) : (
            <T k="debate.status.completedDesc" />
          ),
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          message: <T k="debate.status.cancelled" />,
          description: <T k="debate.status.cancelledDesc" />,
        };
      default:
        return {
          icon: Edit,
          iconColor: "text-gray-600",
          titleColor: "text-gray-800",
          message: <T k="debate.status.unknown" />,
          description: <T k="debate.status.unknownDesc" />,
        };
    }
  };

  const statusConfig = getStatusConfig(debate.status);
  const IconComponent = statusConfig.icon;

  const getWinningSideDisplay = (winningRole: ParticipantRole) => {
    switch (winningRole) {
      case "PROPOSER":
        return <T k="debate.info.proposers" />;
      case "OPPOSER":
        return <T k="debate.info.opposers" />;
      default:
        return <T k="debate.status.winningSide" />;
    }
  };

  const winningParticipantsCount = debate.winCondition?.winningRole
    ? debate.participants.filter(
        (p) => p.role === debate.winCondition?.winningRole,
      ).length
    : 0;

  return (
    <div className="p-3 border rounded-lg bg-muted/50">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <IconComponent className={`w-4 h-4 ${statusConfig.iconColor}`} />
          <span className={`font-medium ${statusConfig.titleColor}`}>
            {statusConfig.message}
          </span>
          <span className="text-muted-foreground">
            • {statusConfig.description}
          </span>
        </div>

        {debate.status === "IN_PROGRESS" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                <T k="debate.status.progress" /> {Math.round(debateProgress)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(debateProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {debate.status === "COMPLETED" && debate.winCondition?.winningRole && (
          <div className="text-xs text-muted-foreground">
            <T k="debate.status.winners" />{" "}
            {getWinningSideDisplay(
              debate.winCondition.winningRole as ParticipantRole,
            )}
            {winningParticipantsCount > 0 &&
              ` (${winningParticipantsCount} participant${winningParticipantsCount > 1 ? "s" : ""})`}
          </div>
        )}

        {debate.status === "OPEN" && (
          <div className="text-xs text-muted-foreground">
            <T
              k="debate.status.participantsJoined"
              values={{
                count: debate.participants.length,
                max: debate.maxParticipants,
              }}
            />
          </div>
        )}

        {debate.status === "DRAFT" && (
          <div className="text-xs text-muted-foreground">
            <T k="debate.info.onlyVisibleToCreator" />
          </div>
        )}
      </div>
    </div>
  );
}
