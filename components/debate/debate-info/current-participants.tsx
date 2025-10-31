import { CheckCircle, Clock, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { DebateRequestsPanelProps } from "@/types/debate-requests";

interface CurrentParticipantsProps {
  debate: DebateRequestsPanelProps["debate"];
}

type DebateParticipant =
  DebateRequestsPanelProps["debate"]["participants"][number];
type DebateArgument = NonNullable<DebateParticipant["arguments"]>[number];

export function CurrentParticipants({ debate }: CurrentParticipantsProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Current Participants</h4>
      <div className="space-y-3">
        {debate.participants.map((participant: DebateParticipant) => {
          const hasParticipatedInCurrentTurn = participant.arguments?.some(
            (argument: DebateArgument) =>
              argument.turnNumber === debate.currentTurnNumber,
          );

          const isCurrentTurn =
            debate.status === "IN_PROGRESS" &&
            debate.currentTurnSide === participant.role &&
            !hasParticipatedInCurrentTurn;

          const isWinner =
            debate.status === "COMPLETED" &&
            debate.winCondition?.winnerId === participant.userId;

          return (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.user.image || ""} />
                  <AvatarFallback>
                    {participant.user.name?.charAt(0) ||
                      participant.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {participant.user.name || participant.user.email}
                    <Badge
                      variant={
                        participant.role === "PROPOSER"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {participant.role.toLowerCase()}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasParticipatedInCurrentTurn && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {isCurrentTurn && (
                  <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
                )}
                {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
              </div>
            </div>
          );
        })}

        {debate.participants.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No participants yet. Invite users to join the debate.
          </p>
        )}
      </div>
    </div>
  );
}
