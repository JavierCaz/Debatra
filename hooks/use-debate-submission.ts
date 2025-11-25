import type { DebateWithDetails } from "@/types/debate";

interface UseDebateSubmissionProps {
  debate: DebateWithDetails;
  currentUserId?: string;
}

export function useDebateSubmission({
  debate,
  currentUserId,
}: UseDebateSubmissionProps) {
  const currentUserParticipant = debate.participants.find(
    (p) => p.userId === currentUserId,
  );

  const isParticipant = !!currentUserParticipant;
  const isCurrentTurn = currentUserParticipant?.role === debate.currentTurnSide;

  const hasSubmittedThisTurn =
    currentUserParticipant?.arguments.some(
      (arg) => arg.turnNumber === debate.currentTurnNumber,
    ) ?? false;

  const canSubmitArguments =
    currentUserParticipant &&
    isCurrentTurn &&
    !hasSubmittedThisTurn &&
    debate.status === "IN_PROGRESS";

  const isArgumentsSubmitterEnabled = canSubmitArguments;

  return {
    currentUserParticipant,
    isParticipant,
    isCurrentTurn,
    hasSubmittedThisTurn,
    canSubmitArguments,
    isArgumentsSubmitterEnabled,
  };
}
