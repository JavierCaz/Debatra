"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DefinitionsSubmitter } from "@/components/debate/definition/definitions-submitter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebateWithDetails } from "@/types/debate";
import type { InitialDefinition } from "@/types/definitions";

interface DefinitionsResponseSectionProps {
  debate: DebateWithDetails;
  supersedeDefinitionId?: string;
  onSupersedeComplete?: () => void;
}

export function DefinitionsResponseSection({
  debate,
  supersedeDefinitionId,
  onSupersedeComplete,
}: DefinitionsResponseSectionProps) {
  const { data: session } = useSession();
  const [definitions, setDefinitions] = useState<InitialDefinition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is a participant
  const currentUserParticipant = debate.participants.find(
    (p) => p.userId === session?.user?.id && p.status === "ACTIVE",
  );

  // Find the definition to supersede if provided
  const definitionToSupersede = supersedeDefinitionId
    ? debate.definitions.find((def) => def.id === supersedeDefinitionId)
    : null;

  // Check if it's the current user's turn (same logic as arguments)
  const isCurrentTurn = currentUserParticipant?.role === debate.currentTurnSide;

  // Use useEffect to pre-fill form when superseding
  useEffect(() => {
    if (
      supersedeDefinitionId &&
      definitionToSupersede &&
      definitions.length === 0
    ) {
      const prefilledDefinition: InitialDefinition = {
        id: Date.now(), // Temporary ID for the form
        term: definitionToSupersede.term,
        definition: definitionToSupersede.definition,
        context: definitionToSupersede.context || "",
        references: definitionToSupersede.references.map((ref) => ({
          id: Date.now() + Math.random(), // Temporary ID
          type: ref.type,
          title: ref.title,
          url: ref.url || "",
          author: ref.author || "",
          publication: ref.publication || "",
          notes: ref.notes || "",
        })),
      };
      setDefinitions([prefilledDefinition]);
    }
  }, [supersedeDefinitionId, definitionToSupersede, definitions.length]);

  // Determine if user can submit definitions (can submit multiple times per turn)
  const canSubmitDefinitions =
    currentUserParticipant && isCurrentTurn && debate.status === "IN_PROGRESS";

  const submitDefinitions = async () => {
    if (definitions.length === 0) {
      setError("At least one definition is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (supersedeDefinitionId) {
        // Submit as superseding definition
        const response = await fetch("/api/definitions/supersede", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalDefinitionId: supersedeDefinitionId,
            newDefinitionData: definitions[0],
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || "Failed to submit improved definition");
        } else {
          // Success - clear form and call completion callback
          setDefinitions([]);
          onSupersedeComplete?.();
        }
      } else {
        // Submit as regular new definition
        const submissionPromises = definitions.map((definition) =>
          fetch("/api/definitions/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              debateId: debate.id,
              definitionData: definition,
              turnNumber: debate.currentTurnNumber, // Include turn number
            }),
          }).then((response) => response.json()),
        );

        const results = await Promise.all(submissionPromises);
        const hasError = results.some((result) => !result.success);

        if (hasError) {
          setError("Some definitions failed to submit");
        } else {
          // Success - clear form and show success message
          setDefinitions([]);
          window.location.reload();
        }
      }
    } catch (error) {
      setError("Failed to submit definitions");
      console.error("Error submitting definitions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = supersedeDefinitionId
    ? "Improve Definition"
    : "Propose New Definitions";

  const description = supersedeDefinitionId
    ? "Modify and improve this definition. Your new version will replace the existing one."
    : `Define key terms and concepts for turn ${debate.currentTurnNumber}. You can propose multiple definitions during your turn.`;

  const submitButtonText = supersedeDefinitionId
    ? `Submit Improved Definition`
    : `Submit ${definitions.length} Definition${definitions.length > 1 ? "s" : ""}`;

  const disabledMessage = !currentUserParticipant
    ? "You are not a participant in this debate"
    : !isCurrentTurn
      ? `It's not your turn. Current turn: ${debate.currentTurnSide}`
      : debate.status !== "IN_PROGRESS"
        ? "This debate is not currently in progress"
        : "Definition submission is not available";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DefinitionsSubmitter
          definitions={definitions}
          onDefinitionsChange={setDefinitions}
          error={error || undefined}
          maxDefinitions={supersedeDefinitionId ? 1 : 5} // Limit to 1 when superseding
          title={title}
          description={description}
          disabled={!canSubmitDefinitions}
          disabledMessage={disabledMessage}
        />

        {definitions.length > 0 && canSubmitDefinitions && (
          <div className="flex justify-end gap-2">
            {supersedeDefinitionId && (
              <Button
                variant="outline"
                onClick={onSupersedeComplete}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button onClick={submitDefinitions} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : submitButtonText}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
