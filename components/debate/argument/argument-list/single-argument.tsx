"use client";

import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import type { DebateWithDetails } from "@/types/debate";
import { ArgumentReferences } from "./argument-references";
import { ArgumentStats } from "./argument-stats";
import { ResponseIndicator } from "./response-indicator";
import { SafeContentRenderer } from "./safe-content-renderer";

interface SingleArgumentProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  isFirstInGroup: boolean;
}

export function SingleArgument({
  argument,
  isFirstInGroup,
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

        <ArgumentStats votes={argument.votes} />
      </div>

      {/* References */}
      {argument.references.length > 0 && (
        <ArgumentReferences references={argument.references} />
      )}
    </div>
  );
}
