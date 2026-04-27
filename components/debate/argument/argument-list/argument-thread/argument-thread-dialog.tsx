"use client";

import { MessageSquare, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DebateWithDetails } from "@/types/debate";
import { ArgumentThreadItem } from "./argument-thread-item";

type ThreadDialogMode = "thread" | "responses";

type ThreadItem = {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  participant: DebateWithDetails["participants"][0];
};

interface ArgumentThreadDialogProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  debate: DebateWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToArgument?: (argumentId: string) => void;
  mode?: ThreadDialogMode;
}

export function ArgumentThreadDialog({
  argument,
  debate,
  open,
  onOpenChange,
  onNavigateToArgument,
  mode = "thread",
}: ArgumentThreadDialogProps) {
  // Create a map of argument ID to participant (for quick lookup)
  const argumentToParticipantMap = new Map<
    string,
    DebateWithDetails["participants"][0]
  >();

  debate.participants.forEach((participant) => {
    participant.arguments.forEach((arg) => {
      argumentToParticipantMap.set(arg.id, participant);
    });
  });

  // Safe participant lookup
  const getParticipant = (argumentId: string) => {
    return argumentToParticipantMap.get(argumentId) ?? null;
  };

  // Get all arguments from all participants
  const allArguments = debate.participants.flatMap((p) => p.arguments);

  const getThreadArguments = (targetArgId: string): ThreadItem[] => {
    if (mode === "thread") {
      const ancestors: ThreadItem["argument"][] = [];
      let currentArgId: string | null = targetArgId;

      while (currentArgId) {
        const currentArg = allArguments.find((arg) => arg.id === currentArgId);
        if (!currentArg) break;
        ancestors.unshift(currentArg);
        currentArgId = currentArg.responseToId;
      }

      return ancestors
        .map((arg): ThreadItem | null => {
          const participant = getParticipant(arg.id);
          return participant ? { argument: arg, participant } : null;
        })
        .filter((item): item is ThreadItem => item !== null);
    }

    // responses mode
    const responses = allArguments
      .filter((arg) => arg.responseToId === targetArgId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    return responses
      .map((response): ThreadItem | null => {
        const participant = getParticipant(response.id);
        return participant ? { argument: response, participant } : null;
      })
      .filter((item): item is ThreadItem => item !== null);
  };

  const threadArguments = getThreadArguments(argument.id);
  const currentParticipant = getParticipant(argument.id);

  // Handle clicking on any argument in the thread
  const handleArgumentClick = (argumentId: string) => {
    onOpenChange(false);
    if (onNavigateToArgument) {
      setTimeout(() => onNavigateToArgument(argumentId), 100);
    }
  };

  const totalArguments = threadArguments.length;

  const dialogConfig =
    mode === "thread"
      ? {
          icon: MessageSquare,
          title: "Argument Thread",
          description: `${totalArguments} argument${totalArguments !== 1 ? "s" : ""} in this thread`,
        }
      : {
          icon: Users,
          title: "Argument Responses",
          description: `${totalArguments} response${totalArguments !== 1 ? "s" : ""} to this argument`,
        };

  const { icon: Icon, title, description } = dialogConfig;

  // Render the current/reference argument
  const renderCurrentArgument = (label: string) => (
    <div>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        {label}
      </div>
      {currentParticipant ? (
        <ArgumentThreadItem
          argument={argument}
          participant={currentParticipant}
          onClick={() => handleArgumentClick(argument.id)}
        />
      ) : (
        <div className="text-sm text-muted-foreground">
          Participant data unavailable
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <ScrollArea className="h-full w-full">
            <div className="space-y-3 pb-4">
              {mode === "thread" && (
                <>
                  {threadArguments.length > 1 && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Previous arguments:
                      </div>
                      <div className="space-y-3">
                        {threadArguments
                          .slice(0, -1)
                          .map(({ argument: arg, participant }) => (
                            <ArgumentThreadItem
                              key={arg.id}
                              argument={arg}
                              participant={participant}
                              onClick={() => handleArgumentClick(arg.id)}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {renderCurrentArgument("Current argument:")}
                </>
              )}

              {mode === "responses" && (
                <>
                  <div className="mb-4 pb-4 border-b">
                    {renderCurrentArgument("Original argument:")}
                  </div>
                  {threadArguments.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Responses:
                      </div>
                      <div className="space-y-3">
                        {threadArguments.map(
                          ({ argument: arg, participant }) => (
                            <ArgumentThreadItem
                              key={arg.id}
                              argument={arg}
                              participant={participant}
                              onClick={() => handleArgumentClick(arg.id)}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 shrink-0">
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
