"use client";

import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import type { DebateWithDetails } from "@/types/debate";
import { VotingButtons } from "../../shared/voting-buttons";
import { ArgumentReferences } from "./argument-references";
import { ResponseIndicator } from "./response-indicator";
import { SafeContentRenderer } from "./safe-content-renderer";

interface SingleArgumentProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  isFirstInGroup: boolean;
  currentUserId?: string;
  onVote?: (argumentId: string, support: boolean) => void;
}

export function SingleArgument({
  argument,
  isFirstInGroup,
  currentUserId,
  onVote,
}: SingleArgumentProps) {
  const getResponseType = () => {
    if (!argument.responseTo) return undefined;

    const currentParticipantRole = argument.participant?.role;
    const targetParticipantRole = argument.responseTo.participant?.role;

    if (currentParticipantRole && targetParticipantRole) {
      const areAllies = currentParticipantRole === targetParticipantRole;
      return areAllies ? "support" : "rebuttal";
    }

    const isSelfResponse =
      argument.participantId === argument.responseTo.participantId;
    return isSelfResponse ? "support" : "rebuttal";
  };

  // Transform votes array to the format VotingButtons expects
  const transformedVotes = argument.votes
    ? {
        support: argument.votes.filter((vote) => vote.support).length,
        oppose: argument.votes.filter((vote) => !vote.support).length,
      }
    : undefined;

  return (
    <div
      id={`argument-${argument.id}`}
      className="space-y-3 scroll-mt-20 relative group"
    >
      {!isFirstInGroup && <Separator />}

      {/* Response Indicator */}
      {argument.responseTo && (
        <ResponseIndicator
          responseTo={argument.responseTo}
          responseType={getResponseType()}
        />
      )}

      {/* Argument Content */}
      <SafeContentRenderer content={argument.content} />

      {/* Argument Metadata */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(argument.createdAt), "PPp")}
        </span>

        {/* Voting Buttons with transformed votes data */}
        <VotingButtons
          itemId={argument.id}
          votes={transformedVotes}
          currentUserId={currentUserId}
          onVote={onVote}
          size="sm"
          orientation="horizontal"
        />
      </div>

      {/* References */}
      {argument.references.length > 0 && (
        <ArgumentReferences references={argument.references} />
      )}
    </div>
  );
}
