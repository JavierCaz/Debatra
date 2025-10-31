import { CheckCircle, Clock } from "lucide-react";
import type { DebateRequestsPanelProps } from "@/types/debate-requests";

interface StatusSummaryProps {
  debate: DebateRequestsPanelProps["debate"];
}

export function StatusSummary({ debate }: StatusSummaryProps) {
  return (
    <div className="p-3 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-sm">
        {debate.status === "IN_PROGRESS" && (
          <>
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Debate in Progress</span>
            <span className="text-muted-foreground">
              • Turn {debate.currentTurnNumber || 1} (
              {debate.currentTurnSide?.toLowerCase() || "proposer"}'s turn)
            </span>
          </>
        )}
        {debate.status === "COMPLETED" && (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">Debate Completed</span>
            {debate.winCondition && (
              <span className="text-muted-foreground">
                • {debate.winCondition.type.toLowerCase().replace("_", " ")}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
