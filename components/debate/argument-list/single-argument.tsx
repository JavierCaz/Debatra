"use client";

import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import type { DebateWithDetails } from "@/types/debate";
import { ArgumentReferences } from "./argument-references";
import { ArgumentStats } from "./argument-stats";
import { RebuttalIndicator } from "./rebuttal-indicator";
import { SafeContentRenderer } from "./safe-content-renderer";

interface SingleArgumentProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  isFirstInGroup: boolean;
}

export function SingleArgument({
  argument,
  isFirstInGroup,
}: SingleArgumentProps) {
  return (
    <div
      id={`argument-${argument.id}`}
      className="space-y-3 scroll-mt-20 relative group"
    >
      {!isFirstInGroup && <Separator />}

      {/* Rebuttal Indicator */}
      {argument.rebuttalTo && (
        <RebuttalIndicator rebuttalTo={argument.rebuttalTo} />
      )}

      {/* Argument Content */}
      <SafeContentRenderer content={argument.content} />

      {/* Argument Metadata */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(argument.createdAt), "PPp")}
        </span>

        <ArgumentStats
          votes={argument.votes}
          rebuttalsCount={argument._count?.rebuttals || 0}
        />
      </div>

      {/* References */}
      {argument.references.length > 0 && (
        <ArgumentReferences references={argument.references} />
      )}
    </div>
  );
}
