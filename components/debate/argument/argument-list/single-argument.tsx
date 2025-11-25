"use client";

import { format } from "date-fns";
import { MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { DebateWithDetails } from "@/types/debate";
import { VotingButtons } from "../../shared/voting-buttons";
import { ArgumentReferences } from "./argument-references";
import { ArgumentThreadDialog } from "./argument-thread/argument-thread-dialog";
import { ResponseIndicator } from "./response-indicator";
import { SafeContentRenderer } from "./safe-content-renderer";

interface SingleArgumentProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  debate?: DebateWithDetails;
  isFirstInGroup: boolean;
  currentUserId?: string;
  onVote?: (argumentId: string, support: boolean) => void;
  onNavigateToArgument?: (argumentId: string) => void;
}

// Helper function to count ancestors in the thread
const countAncestors = (
  argument: SingleArgumentProps["argument"],
  debate?: DebateWithDetails,
): number => {
  if (!debate || !argument.responseToId) return 0;

  let count = 0;
  let currentArgument = argument.responseTo;

  // Traverse up the response chain to count ancestors
  while (currentArgument) {
    count++;
    // If the current argument also has a parent, continue traversing
    if (currentArgument.responseToId) {
      // Find the parent argument in the debate data
      const parentArgument = debate.participants
        .flatMap((p) => p.arguments)
        .find((arg) => arg.id === currentArgument?.responseToId);

      if (parentArgument) {
        currentArgument = parentArgument;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return count;
};

export function SingleArgument({
  argument,
  debate,
  isFirstInGroup,
  currentUserId,
  onVote,
  onNavigateToArgument, // Make sure this is destructured
}: SingleArgumentProps) {
  const [showThread, setShowThread] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [threadArgumentId, setThreadArgumentId] = useState<string | null>(null);

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

  // Use _count.responses from Prisma query for direct responses
  const responseCount = argument._count?.responses || 0;
  const hasResponses = responseCount > 0;
  const isReply = !!argument.responseToId;

  // Count ancestors in the thread
  const ancestorCount = countAncestors(argument, debate);
  const hasAncestors = ancestorCount > 0;

  // Transform votes array to the format VotingButtons expects
  const transformedVotes = argument.votes
    ? {
        support: argument.votes.filter((vote) => vote.support).length,
        oppose: argument.votes.filter((vote) => !vote.support).length,
      }
    : undefined;

  // Handle opening thread for a specific argument
  const handleOpenThread = (argumentId: string) => {
    setThreadArgumentId(argumentId);
    setShowThread(true);
  };

  // Handle navigation to an argument (scroll to it)
  const handleNavigateToArgument = (argumentId: string) => {
    // If we have the callback from ArgumentsList, use it (for accordion support)
    if (onNavigateToArgument) {
      onNavigateToArgument(argumentId);
    } else {
      // Fallback to original behavior
      const targetArgument = document.getElementById(`argument-${argumentId}`);
      if (targetArgument) {
        targetArgument.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Add a temporary highlight effect
        targetArgument.classList.add("bg-yellow-50", "dark:bg-yellow-900/20");
        setTimeout(() => {
          targetArgument.classList.remove(
            "bg-yellow-50",
            "dark:bg-yellow-900/20",
          );
        }, 2000);
      }
    }
  };

  // Get the current argument for the thread dialog
  const getThreadArgument = () => {
    if (!debate) return argument;

    // If we have a specific thread argument ID, find it
    if (threadArgumentId) {
      const foundArgument = debate.participants
        .flatMap((p) => p.arguments)
        .find((arg) => arg.id === threadArgumentId);

      return foundArgument || argument;
    }

    return argument;
  };

  return (
    <>
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
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {format(new Date(argument.createdAt), "PPp")}
            </span>

            {/* Thread & Responses Buttons - Only show if debate is provided and this argument has ancestors or responses */}
            {debate && (hasAncestors || hasResponses || isReply) && (
              <div className="flex items-center gap-2">
                {/* Thread button (shows ancestors) - Only show if there are ancestors */}
                {hasAncestors && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground"
                    onClick={() => handleOpenThread(argument.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Thread ({ancestorCount})
                  </Button>
                )}

                {/* Responses button (shows responses) - Only show if there are responses */}
                {hasResponses && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground"
                    onClick={() => setShowResponses(true)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Responses ({responseCount})
                  </Button>
                )}
              </div>
            )}
          </div>

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

      {/* Thread Dialog (shows ancestors) */}
      {debate && (
        <ArgumentThreadDialog
          argument={getThreadArgument()}
          debate={debate}
          open={showThread}
          onOpenChange={setShowThread}
          onNavigateToArgument={handleNavigateToArgument}
          mode="thread"
        />
      )}

      {/* Responses Dialog (shows responses) */}
      {debate && hasResponses && (
        <ArgumentThreadDialog
          argument={argument}
          debate={debate}
          open={showResponses}
          onOpenChange={setShowResponses}
          onNavigateToArgument={handleNavigateToArgument}
          mode="responses"
        />
      )}
    </>
  );
}
