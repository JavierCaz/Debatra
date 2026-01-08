import { CheckCircle, Clock, Flag, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { DebateRequestsPanelProps } from "@/types/debate-requests";
import { TurnCountdown } from "./turn-countdown";

interface CurrentParticipantsProps {
  debate: DebateRequestsPanelProps["debate"];
  currentUserId?: string;
}

type DebateParticipant =
  DebateRequestsPanelProps["debate"]["participants"][number];

export function CurrentParticipants({
  debate,
  currentUserId,
}: CurrentParticipantsProps) {
  const lastArgumentTime = (() => {
    const allArguments = debate.participants.flatMap((p) => p.arguments || []);

    if (allArguments.length === 0) {
      return debate.startedAt || new Date();
    }

    let latestArgument = allArguments[0];
    for (const argument of allArguments) {
      const currentArg = argument as any;
      const latestArg = latestArgument as any;
      if (new Date(currentArg.createdAt) > new Date(latestArg.createdAt)) {
        latestArgument = argument;
      }
    }

    return (latestArgument as any).createdAt;
  })();

  // Get current user's participant data
  const currentUserParticipant = debate.participants.find(
    (p) => p.userId === currentUserId,
  );
  const canSubmitArguments =
    currentUserParticipant?.role === debate.currentTurnSide &&
    !currentUserParticipant.arguments?.some(
      (arg) => arg.turnNumber === debate.currentTurnNumber,
    ) &&
    debate.status === "IN_PROGRESS";

  // Group participants by role
  const proposers = debate.participants.filter((p) => p.role === "PROPOSER");
  const opposers = debate.participants.filter((p) => p.role === "OPPOSER");

  const ParticipantItem = ({
    participant,
  }: {
    participant: DebateParticipant;
  }) => {
    const hasParticipatedInCurrentTurn = participant.arguments?.some(
      (argument: any) => argument.turnNumber === debate.currentTurnNumber,
    );

    const isCurrentTurn =
      debate.status === "IN_PROGRESS" &&
      debate.currentTurnSide === participant.role &&
      !hasParticipatedInCurrentTurn;

    const isWinner =
      debate.status === "COMPLETED" &&
      debate.winCondition?.winningRole === participant.role;

    const isCreator = participant.userId === debate.creatorId;
    const hasForfeited = participant.status === "FORFEITED";

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
                <Badge variant="outline" className="text-xs">
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
          {hasForfeited && <Flag className="w-4 h-4 text-destructive" />}
          {hasParticipatedInCurrentTurn && !hasForfeited && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          {isCurrentTurn && !hasForfeited && (
            <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
          )}
          {isWinner && !hasForfeited && (
            <Trophy className="w-4 h-4 text-green-600" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Turn Countdown Banner - Only show during active debate */}
      {debate.status === "IN_PROGRESS" && debate.turnTimeLimit && (
        <div className="mb-4">
          <TurnCountdown
            lastArgumentTime={lastArgumentTime}
            turnTimeLimitHours={debate.turnTimeLimit}
            canSubmitArguments={canSubmitArguments ?? false}
          />
        </div>
      )}

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
