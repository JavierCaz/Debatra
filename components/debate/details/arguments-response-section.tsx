"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useDebateSubmission } from "@/hooks/use-debate-submission";
import type { DebateWithDetails, InitialArgument } from "@/types/debate";
import { ArgumentsSubmitter } from "../argument/arguments-submitter";

interface ArgumentsResponseSectionProps {
  debate: DebateWithDetails;
  replyToArgumentId?: string | null;
  onReplyComplete?: () => void;
}

export function ArgumentsResponseSection({
  debate,
  replyToArgumentId = null,
  onReplyComplete,
}: ArgumentsResponseSectionProps) {
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
      // Check if we already have a reply argument for this target
      const existingReplyIndex = argumentsList.findIndex(
        (arg) => arg.responseToId === replyToArgumentId,
      );

      if (existingReplyIndex === -1) {
        // Add a new reply argument to the existing list
        const newReplyArgument: InitialArgument = {
          id: Date.now(),
          content: "",
          references: [],
          responseToId: replyToArgumentId,
        };
        setArgumentsList((prev) => [...prev, newReplyArgument]);
      }
    }
  }, [replyToArgumentId, argumentsList]);

  // Function to remove a specific reply argument
  const removeReplyArgument = () => {
    if (replyToArgumentId) {
      setArgumentsList((prev) =>
        prev.filter((arg) => arg.responseToId !== replyToArgumentId),
      );
      if (onReplyComplete) {
        onReplyComplete();
      }
    }
  };

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
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isForfeit ? "forfeit debate" : "submit arguments"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDisabledMessage = () => {
    if (!currentUserParticipant) {
      return "You are not a participant in this debate";
    }
    if (!isCurrentTurn) {
      return `It's not your turn. Current turn: ${debate.currentTurnSide}`;
    }
    if (hasSubmittedThisTurn) {
      return "You have already submitted your arguments for this turn";
    }
    if (debate.status !== "IN_PROGRESS") {
      return "This debate is not currently in progress";
    }
    return "Argument submission is not available";
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      return isForfeit ? "Forfeiting..." : "Submitting...";
    }
    if (isForfeit) {
      return "Forfeit Debate";
    }
    return isInReplyMode ? "Submit Arguments & Reply" : "Submit Arguments";
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
        <CardTitle>Submit Your Arguments</CardTitle>
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
              Forfeit
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
          title={isInReplyMode ? "Your Arguments & Reply" : "Your Arguments"}
          description={
            isInReplyMode
              ? "You can add multiple arguments. One of them is specifically replying to another argument."
              : `Present your arguments for turn ${debate.currentTurnNumber}. You can add multiple arguments.`
          }
          disabled={!canSubmitArguments}
          disabledMessage={getDisabledMessage()}
          isReply={isInReplyMode}
          replyToArgumentId={replyToArgumentId || undefined}
          isForfeit={isForfeit} // Pass forfeit state here
        />

        {canSubmitArguments && (
          <div className="flex justify-end gap-2">
            {isInReplyMode && !isForfeit && (
              <Button
                variant="outline"
                onClick={removeReplyArgument}
                disabled={isLoading}
              >
                Remove Reply
              </Button>
            )}
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
