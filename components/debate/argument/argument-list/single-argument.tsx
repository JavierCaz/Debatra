"use client";

import { format } from "date-fns";
import { MessageSquare, Reply, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDebateSubmission } from "@/hooks/use-debate-submission";
import type { DebateWithDetails } from "@/types/debate";
import { ReferenceList } from "../../reference/reference-list";
import { VotingButtons } from "../../shared/voting-buttons";
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
  onReply?: (argumentId: string) => void;
}

const countAncestors = (
  argument: SingleArgumentProps["argument"],
  debate?: DebateWithDetails,
): number => {
  if (!debate || !argument.responseToId) return 0;

  let count = 0;
  let currentArgument = argument.responseTo;

  while (currentArgument) {
    count++;
    if (currentArgument.responseToId) {
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
  onNavigateToArgument,
  onReply,
}: SingleArgumentProps) {
  const { t } = useTranslation();
  const [showThread, setShowThread] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [threadArgumentId, setThreadArgumentId] = useState<string | null>(null);

  const { isArgumentsSubmitterEnabled } = useDebateSubmission({
    debate: debate as DebateWithDetails,
    currentUserId,
  });

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

  const responseCount = argument._count?.responses || 0;
  const hasResponses = responseCount > 0;
  const isReply = !!argument.responseToId;

  const ancestorCount = countAncestors(argument, debate);
  const hasAncestors = ancestorCount > 0;

  const transformedVotes = argument.votes
    ? {
        support: argument.votes.filter((vote) => vote.support).length,
        oppose: argument.votes.filter((vote) => !vote.support).length,
      }
    : undefined;

  const handleOpenThread = (argumentId: string) => {
    setThreadArgumentId(argumentId);
    setShowThread(true);
  };

  const handleNavigateToArgument = (argumentId: string) => {
    if (onNavigateToArgument) {
      onNavigateToArgument(argumentId);
    } else {
      const targetArgument = document.getElementById(`argument-${argumentId}`);
      if (targetArgument) {
        targetArgument.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

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

  const handleReply = () => {
    if (onReply && isArgumentsSubmitterEnabled) {
      onReply(argument.id);
    }
  };

  const getThreadArgument = () => {
    if (!debate) return argument;

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

        {argument.responseTo && (
          <ResponseIndicator
            responseTo={argument.responseTo}
            responseType={getResponseType()}
          />
        )}

        <SafeContentRenderer content={argument.content} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {format(new Date(argument.createdAt), "PPp")}
            </span>

            {debate && (hasAncestors || hasResponses || isReply) && (
              <div className="flex flex-wrap items-center gap-2">
                {hasAncestors && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground"
                    onClick={() => handleOpenThread(argument.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {t("debate.argument.thread")} ({ancestorCount})
                  </Button>
                )}

                {hasResponses && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground"
                    onClick={() => setShowResponses(true)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {t("debate.argument.responses")} ({responseCount})
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isArgumentsSubmitterEnabled && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={handleReply}
              >
                <Reply className="h-3 w-3 mr-1" />
                {t("debate.argument.reply")}
              </Button>
            )}

            <VotingButtons
              itemId={argument.id}
              votes={transformedVotes}
              currentUserId={currentUserId}
              onVote={onVote}
              size="sm"
              orientation="horizontal"
            />
          </div>
        </div>

        {argument.references.length > 0 && (
          <ReferenceList references={argument.references} />
        )}
      </div>

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
