import { CheckCircle, Clock, Crown, Trophy } from "lucide-react";
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
  // Group participants by role
  const proposers = debate.participants.filter((p) => p.role === "PROPOSER");
  const opposers = debate.participants.filter((p) => p.role === "OPPOSER");

  const ParticipantItem = ({
    participant,
  }: {
    participant: DebateParticipant;
  }) => {
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

    const isCreator = participant.userId === debate.creatorId;

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={participant.user.image || ""} />
            <AvatarFallback>
              {participant.user.name?.charAt(0) ||
                participant.user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {participant.user.name || participant.user.email}
              </p>
              {isCreator && (
                <Badge variant="outline" className="text-xs ">
                  Creator
                </Badge>
              )}
            </div>
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
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Current Participants</h4>
      <div className="space-y-4">
        {/* Proposers Team */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              Proposers
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({proposers.length})
            </span>
          </div>
          <div className="space-y-2">
            {proposers.map((participant) => (
              <ParticipantItem
                key={participant.userId}
                participant={participant}
              />
            ))}
            {proposers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2 border rounded-lg">
                No proposers yet
              </p>
            )}
          </div>
        </div>

        {/* Opposers Team */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Opposers
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({opposers.length})
            </span>
          </div>
          <div className="space-y-2">
            {opposers.map((participant) => (
              <ParticipantItem
                key={participant.userId}
                participant={participant}
              />
            ))}
            {opposers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2 border rounded-lg">
                No opposers yet
              </p>
            )}
          </div>
        </div>

        {/* Empty state */}
        {debate.participants.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No participants yet. Invite users to join the debate.
          </p>
        )}
      </div>
    </div>
  );
}
