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
  mode = "thread", // Default to thread mode
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

  // Get all arguments from all participants
  const allArguments = debate.participants.flatMap((p) => p.arguments);

  // Build thread: ancestors for "thread" mode, responses for "responses" mode
  const getThreadArguments = (targetArgId: string) => {
    if (mode === "thread") {
      // Thread mode: show ancestors (root to current argument)
      const ancestors: DebateWithDetails["participants"][0]["arguments"][0][] =
        [];
      let currentArgId: string | null = targetArgId;

      // Traverse up the response chain
      while (currentArgId) {
        const currentArg = allArguments.find((arg) => arg.id === currentArgId);
        if (!currentArg) break;

        ancestors.unshift(currentArg); // Add to beginning to maintain chronological order
        currentArgId = currentArg.responseToId;
      }

      return ancestors.map((arg) => ({
        argument: arg,
        participant: argumentToParticipantMap.get(arg.id)!,
      }));
    } else {
      // Responses mode: show responses to this argument
      const responses = allArguments
        .filter((arg) => arg.responseToId === targetArgId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      return responses.map((response) => ({
        argument: response,
        participant: argumentToParticipantMap.get(response.id)!,
      }));
    }
  };

  const threadArguments = getThreadArguments(argument.id);

  // Handle clicking on any argument in the thread
  const handleArgumentClick = (argumentId: string) => {
    // Close the dialog
    onOpenChange(false);

    // If a navigation callback is provided, use it to scroll to the argument
    if (onNavigateToArgument) {
      // Small delay to ensure dialog is closed before scrolling
      setTimeout(() => {
        onNavigateToArgument(argumentId);
      }, 100);
    }
  };

  // Calculate total arguments in the thread
  const totalArguments = threadArguments.length;

  // Get dialog title and icon based on mode
  const getDialogConfig = () => {
    if (mode === "thread") {
      return {
        icon: MessageSquare,
        title: "Argument Thread",
        description: `${totalArguments} argument${totalArguments !== 1 ? "s" : ""} in this thread`,
      };
    } else {
      return {
        icon: Users,
        title: "Argument Responses",
        description: `${totalArguments} response${totalArguments !== 1 ? "s" : ""} to this argument`,
      };
    }
  };

  const { icon: Icon, title, description } = getDialogConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          <ScrollArea className="h-full w-full">
            <div className="space-y-3 pb-4">
              {/* For thread mode, show the current argument at the bottom */}
              {mode === "thread" && (
                <>
                  {/* Thread arguments (ancestors) */}
                  {threadArguments.length > 1 && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Thread arguments:
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

                  {/* Current argument (the one you clicked on) */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Current argument:
                    </div>
                    <ArgumentThreadItem
                      argument={
                        threadArguments[threadArguments.length - 1]?.argument ||
                        argument
                      }
                      participant={argumentToParticipantMap.get(argument.id)!}
                      onClick={() => handleArgumentClick(argument.id)}
                    />
                  </div>
                </>
              )}

              {/* For responses mode, show the original argument first */}
              {mode === "responses" && (
                <>
                  <div className="mb-4 pb-4 border-b">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Original argument:
                    </div>
                    <ArgumentThreadItem
                      argument={argument}
                      participant={argumentToParticipantMap.get(argument.id)!}
                      onClick={() => handleArgumentClick(argument.id)}
                    />
                  </div>

                  {/* Responses to the argument */}
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

        {/* Dialog footer with actions */}
        <div className="px-6 py-4 border-t bg-muted/20 shrink-0">
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
