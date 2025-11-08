"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InitialArgument } from "@/types/debate";
import { ArgumentsSubmitter } from "../argument/arguments-submitter";

interface DebateParticipant {
  id: string;
  userId: string;
  status: string;
  role: string;
  joinedAt: Date;
  invitedAt: Date | null;
  respondedAt: Date | null;
  debateId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  arguments: Array<{
    id: string;
    turnNumber: number;
    createdAt: Date;
  }>;
}

interface Debate {
  id: string;
  title: string;
  description: string;
  status: string;
  format: string;
  maxParticipants: number;
  turnsPerSide: number;
  currentTurnSide: string;
  currentTurnNumber: number;
  participants: DebateParticipant[];
}

interface DebateResponseSectionProps {
  debate: Debate;
}

export function DebateResponseSection({ debate }: DebateResponseSectionProps) {
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

  const currentUserParticipant = debate.participants.find(
    (p) => p.user.id === session?.user?.id,
  );

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

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/debates/arguments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateId: debate.id,
          arguments: argumentsList,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit arguments");
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

        // Refresh the page to show updated debate state
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to submit arguments");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit arguments",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Submit Your Arguments</CardTitle>
        <p className="text-sm text-muted-foreground">
          Present your arguments for turn {debate.currentTurnNumber} with
          supporting evidence and references
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ArgumentsSubmitter
          initialArguments={argumentsList}
          error={error}
          onArgumentsChange={setArgumentsList}
          mode="respond"
          title="Your Arguments"
          description={`Present your arguments for turn ${debate.currentTurnNumber}. You can add multiple arguments.`}
          disabled={!canSubmitArguments}
          disabledMessage={
            !currentUserParticipant
              ? "You are not a participant in this debate"
              : !isCurrentTurn
                ? `It's not your turn. Current turn: ${debate.currentTurnSide}`
                : hasSubmittedThisTurn
                  ? "You have already submitted your arguments for this turn"
                  : debate.status !== "IN_PROGRESS"
                    ? "This debate is not currently in progress"
                    : "Argument submission is not available"
          }
        />

        {canSubmitArguments && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Arguments"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
