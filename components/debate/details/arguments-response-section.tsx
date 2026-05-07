"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useDebateSubmission } from "@/hooks/use-debate-submission";
import { translateSubmitError } from "@/lib/i18n/error-translations";
import type { DebateWithDetails, InitialArgument } from "@/types/debate";
import { ArgumentsSubmitter } from "../argument/arguments-submitter";

interface ArgumentsResponseSectionProps {
  debate: DebateWithDetails;
  replyToArgumentId?: string | null;
  onReplyComplete?: () => void;
  replyFocusKey?: number;
}

export function ArgumentsResponseSection({
  debate,
  replyToArgumentId = null,
  onReplyComplete,
  replyFocusKey = 0,
}: ArgumentsResponseSectionProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const [argumentsList, setArgumentsList] = useState<InitialArgument[]>([
    {
      id: Date.now(),
      content: "",
      references: [],
    },
  ]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForfeit, setIsForfeit] = useState(false);

  // Use the shared hook
  const {
    currentUserParticipant,
    canSubmitArguments,
    isCurrentTurn,
    hasSubmittedThisTurn,
  } = useDebateSubmission({
    debate,
    currentUserId: session?.user?.id,
  });

  // Update argumentsList when replyToArgumentId changes
  useEffect(() => {
    if (replyToArgumentId) {
      setArgumentsList((prev) => {
        const existing = prev.find(
          (arg) => arg.responseToId === replyToArgumentId,
        );
        if (existing) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            content: "",
            references: [],
            responseToId: replyToArgumentId,
          },
        ];
      });
    }
  }, [replyToArgumentId]);

  // Handle forfeit toggle change
  const handleForfeitToggle = (checked: boolean) => {
    setIsForfeit(checked);
    // Clear all arguments when switching to forfeit mode
    if (checked) {
      setArgumentsList([
        {
          id: Date.now(),
          content: "",
          references: [],
        },
      ]);
    }
  };

  const replyContextMap = useMemo(() => {
    const map = new Map<
      string,
      { userName: string; argumentNumber: number; turnNumber: number }
    >();
    for (const participant of debate.participants) {
      const sortedArgs = [...participant.arguments].sort(
        (a, b) =>
          a.turnNumber - b.turnNumber ||
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      sortedArgs.forEach((arg, index) => {
        map.set(arg.id, {
          userName: participant.user.name || "Unknown",
          argumentNumber: index + 1,
          turnNumber: arg.turnNumber,
        });
      });
    }
    return map;
  }, [debate]);

  const isInReplyMode = !!replyToArgumentId;

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/arguments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateId: debate.id,
          arguments: argumentsList,
          isForfeit,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Failed to ${isForfeit ? "forfeit debate" : "submit arguments"}`,
        );
      }

      if (result.success) {
        // Clear form after successful submission
        setArgumentsList([
          {
            id: Date.now(),
            content: "",
            references: [],
          },
        ]);

        // Reset forfeit state
        setIsForfeit(false);

        // Notify parent that reply is complete
        if (onReplyComplete) {
          onReplyComplete();
        }

        // Refresh the page to show updated debate state
        router.refresh();
      } else {
        throw new Error(
          result.error ||
            `Failed to ${isForfeit ? "forfeit debate" : "submit arguments"}`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(translateSubmitError(message, t, isForfeit));
    } finally {
      setIsLoading(false);
    }
  };

  const getDisabledMessage = () => {
    if (!currentUserParticipant) {
      return t("debate.argument.notParticipant");
    }
    if (!isCurrentTurn) {
      return t("debate.argument.notYourTurn", { side: debate.currentTurnSide });
    }
    if (hasSubmittedThisTurn) {
      return t("debate.argument.alreadySubmitted");
    }
    if (debate.status !== "IN_PROGRESS") {
      return t("debate.argument.notInProgress");
    }
    return t("debate.argument.submissionNotAvailable");
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      return isForfeit
        ? t("debate.argument.forfeiting")
        : t("debate.argument.submitting");
    }
    if (isForfeit) {
      return t("debate.argument.forfeitDebate");
    }
    return isInReplyMode
      ? t("debate.argument.submitArgsReply")
      : t("debate.argument.submitArgs");
  };

  const getSubmitButtonVariant = () => {
    if (isForfeit) {
      return "destructive";
    }
    return "default";
  };

  return (
    <Card id="arguments-response-section" className="mb-6">
      <CardHeader>
        <CardTitle>{t("debate.argument.yourArgs")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isInReplyMode
            ? `You are replying to an argument. Your response will be linked to the original argument.`
            : `Present your arguments for turn ${debate.currentTurnNumber} with supporting evidence and references`}
        </p>

        {/* Add Forfeit Toggle Section */}
        {canSubmitArguments && (
          <div className="flex items-center space-x-2 pt-2">
            <Toggle
              id="forfeit-mode"
              pressed={isForfeit}
              onPressedChange={handleForfeitToggle}
              disabled={isLoading}
              aria-label="Forfeit the debate"
              variant="outline"
              className="data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:border-destructive"
            >
              {t("debate.argument.forfeit")}
            </Toggle>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always render ArgumentsSubmitter, just pass isForfeit prop */}
        <ArgumentsSubmitter
          initialArguments={argumentsList}
          error={error}
          onArgumentsChange={setArgumentsList}
          mode="respond"
          title={
            isInReplyMode
              ? t("debate.argument.yourArgsReply")
              : t("debate.argument.yourArgs")
          }
          description={
            isInReplyMode
              ? "You can add multiple arguments. One of them is specifically replying to another argument."
              : `Present your arguments for turn ${debate.currentTurnNumber}. You can add multiple arguments.`
          }
          disabled={!canSubmitArguments}
          disabledMessage={getDisabledMessage()}
          replyToArgumentId={replyToArgumentId || undefined}
          replyContextMap={replyContextMap}
          isForfeit={isForfeit}
          replyFocusKey={replyFocusKey}
        />

        {canSubmitArguments && (
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              variant={getSubmitButtonVariant()}
            >
              {getSubmitButtonText()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
