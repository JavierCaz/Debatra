import { CheckCircle, Clock, Edit, Users, XCircle } from "lucide-react";
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
          message: "Draft Debate",
          description: "This debate is still being set up",
        };
      case "OPEN":
        return {
          icon: Users,
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          message: "Open for Participants",
          description: "Waiting for participants to join",
        };
      case "IN_PROGRESS":
        return {
          icon: Clock,
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          message: "Debate in Progress",
          description: `Turn ${currentTurn} of ${totalPossibleTurns}`,
        };
      case "COMPLETED":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          message: "Debate Completed",
          description: debate.winCondition
            ? `${debate.winCondition.type.toLowerCase().replace("_", " ")}`
            : "Debate has concluded",
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          message: "Debate Cancelled",
          description: "This debate has been cancelled",
        };
      default:
        return {
          icon: Edit,
          iconColor: "text-gray-600",
          titleColor: "text-gray-800",
          message: "Unknown Status",
          description: "This debate has an unknown status",
        };
    }
  };

  const statusConfig = getStatusConfig(debate.status);
  const IconComponent = statusConfig.icon;

  return (
    <div className="p-3 border rounded-lg bg-muted/50">
      <div className="space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <IconComponent className={`w-4 h-4 ${statusConfig.iconColor}`} />
          <span className={`font-medium ${statusConfig.titleColor}`}>
            {statusConfig.message}
          </span>
          <span className="text-muted-foreground">
            • {statusConfig.description}
          </span>
        </div>

        {/* Progress Bar */}
        {debate.status === "IN_PROGRESS" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Progress: {Math.round(debateProgress)}%
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

        {/* Additional info for COMPLETED debates with winners */}
        {debate.status === "COMPLETED" && debate.winCondition?.winnerId && (
          <div className="text-xs text-muted-foreground">
            Winner:{" "}
            {debate.participants.find(
              (p) => p.userId === debate.winCondition?.winnerId,
            )?.user.name || "Unknown"}
          </div>
        )}

        {/* Additional info for OPEN debates */}
        {debate.status === "OPEN" && (
          <div className="text-xs text-muted-foreground">
            {debate.participants.length} of {debate.maxParticipants}{" "}
            participants joined
          </div>
        )}

        {/* Additional info for DRAFT debates */}
        {debate.status === "DRAFT" && (
          <div className="text-xs text-muted-foreground">
            Only visible to the creator
          </div>
        )}
      </div>
    </div>
  );
}
