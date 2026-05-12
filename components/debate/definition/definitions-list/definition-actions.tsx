"use client";

import { BookOpen, CheckCircle2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Definition } from "@/types/definitions";

interface DefinitionActionsProps {
  definitionId: string;
  status: Definition["status"];
  votes?: {
    support: number;
    oppose: number;
  };
  currentUserId?: string;
  isParticipant?: boolean;
  isUsersTurn?: boolean;
  isOppositeTeam?: boolean;
  onVote?: (definitionId: string, support: boolean) => void;
  onAccept?: (definitionId: string) => void;
  onSupersede?: (definitionId: string) => void;
}

export function DefinitionActions({
  definitionId,
  status,
  votes,
  currentUserId,
  isParticipant = false,
  isUsersTurn = false,
  isOppositeTeam = false,
  onVote,
  onAccept,
  onSupersede,
}: DefinitionActionsProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false);

  const handleAction = async (action: "accept" | "supersede") => {
    if (isSubmitting) return;

    setIsSubmitting(action);
    try {
      switch (action) {
        case "accept":
          await onAccept?.(definitionId);
          break;
        case "supersede":
          await onSupersede?.(definitionId);
          break;
      }
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleVote = async (support: boolean) => {
    if (isVoteSubmitting || !onVote) return;

    setIsVoteSubmitting(true);
    try {
      await onVote(definitionId, support);
    } finally {
      setIsVoteSubmitting(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    action: "accept" | "supersede",
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAction(action);
    }
  };

  const handleVoteKeyDown = (event: React.KeyboardEvent, support: boolean) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleVote(support);
    }
  };

  const canImprove = isParticipant && isUsersTurn && status === "PROPOSED";
  const canAccept = isParticipant && isOppositeTeam && status === "PROPOSED";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {isParticipant && status === "PROPOSED" && (
          <div className="flex items-center gap-2">
            {onAccept && canAccept && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting === "accept"}
                onClick={() => handleAction("accept")}
                onKeyDown={(e) => handleKeyDown(e, "accept")}
                className="gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-500 dark:border-green-800 dark:hover:bg-green-950/20"
                aria-label={t("debate.voting.accept")}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("debate.voting.accept")}
              </Button>
            )}
            {onSupersede && canImprove && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting === "supersede"}
                onClick={() => handleAction("supersede")}
                onKeyDown={(e) => handleKeyDown(e, "supersede")}
                className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-500 dark:border-blue-800 dark:hover:bg-blue-950/20"
                aria-label={t("debate.voting.improve")}
              >
                <BookOpen className="h-4 w-4" />
                {t("debate.voting.improve")}
              </Button>
            )}
          </div>
        )}
      </div>

      {currentUserId && onVote && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={isVoteSubmitting}
            onClick={() => handleVote(true)}
            onKeyDown={(e) => handleVoteKeyDown(e, true)}
            className="gap-1 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
            aria-label={t("debate.voting.supportDefAria", {
              count: votes?.support || 0,
            })}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">{votes?.support || 0}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isVoteSubmitting}
            onClick={() => handleVote(false)}
            onKeyDown={(e) => handleVoteKeyDown(e, false)}
            className="gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
            aria-label={t("debate.voting.opposeDefAria", {
              count: votes?.oppose || 0,
            })}
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-xs">{votes?.oppose || 0}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
