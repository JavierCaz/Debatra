"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/debate/formatters";
import {
  getParticipantsInOrder,
  type groupArgumentsByTurn,
} from "@/lib/debate/stats";
import { cn } from "@/lib/utils";
import type { DebateWithDetails } from "@/types/debate";
import { SingleArgument } from "./single-argument";

interface ArgumentsListProps {
  argumentsByTurn: ReturnType<typeof groupArgumentsByTurn>;
  turnNumbers: number[];
  debate: DebateWithDetails;
  currentUserId?: string;
  onVote?: (argumentId: string, support: boolean) => void;
  onReply?: (argumentId: string) => void;
}

export function ArgumentsList({
  argumentsByTurn,
  turnNumbers,
  debate,
  currentUserId,
  onVote,
  onReply,
}: ArgumentsListProps) {
  const [openTurns, setOpenTurns] = useState<string[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Set initial open accordion based on debate status (only on first load)
  useEffect(() => {
    if (
      turnNumbers.length > 0 &&
      openTurns.length === 0 &&
      !hasUserInteracted
    ) {
      let turnToOpen: number;

      if (debate.status === "COMPLETED" || debate.status === "CANCELLED") {
        // For finished debates, open the first turn
        turnToOpen = turnNumbers[0];
      } else {
        // For debates in progress, open the last turn
        turnToOpen = turnNumbers[turnNumbers.length - 1];
      }

      setOpenTurns([`turn-${turnToOpen}`]);
    }
  }, [turnNumbers, openTurns.length, debate.status, hasUserInteracted]);

  // Track user interaction
  const handleAccordionChange = (value: string[]) => {
    setHasUserInteracted(true);
    setOpenTurns(value);
  };

  // Function to open a specific turn
  const handleOpenTurn = (turnNumber: number) => {
    const turnValue = `turn-${turnNumber}`;
    setHasUserInteracted(true);
    if (!openTurns.includes(turnValue)) {
      setOpenTurns((prev) => [...prev, turnValue]);
    }
  };

  // Function to navigate to an argument (opens turn if needed and scrolls)
  const handleNavigateToArgument = (argumentId: string) => {
    // Find which turn contains the argument
    const targetTurn = turnNumbers.find((turn) => {
      const turnArgs = argumentsByTurn[turn];
      return Object.values(turnArgs).some((participantData) =>
        participantData.arguments.some((arg) => arg.id === argumentId),
      );
    });

    if (targetTurn) {
      handleOpenTurn(targetTurn);

      // Scroll to the argument after the accordion opens
      setTimeout(() => {
        const targetArgument = document.getElementById(
          `argument-${argumentId}`,
        );
        if (targetArgument) {
          targetArgument.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add highlight effect
          targetArgument.classList.add("bg-yellow-50", "dark:bg-yellow-900/20");
          setTimeout(() => {
            targetArgument.classList.remove(
              "bg-yellow-50",
              "dark:bg-yellow-900/20",
            );
          }, 2000);
        }
      }, 300); // Small delay for accordion animation
    }
  };

  return (
    <div className="space-y-4">
      <Accordion
        type="multiple"
        value={openTurns}
        onValueChange={handleAccordionChange}
        className="space-y-6"
      >
        {turnNumbers.map((turnNumber) => {
          const turnData = argumentsByTurn[turnNumber];
          const participantsInOrder = getParticipantsInOrder(turnData);

          const participantsByRole = participantsInOrder.reduce(
            (acc, participant) => {
              const role = participant.role;
              if (!acc[role]) {
                acc[role] = [];
              }
              acc[role].push(participant);
              return acc;
            },
            {} as Record<string, typeof participantsInOrder>,
          );

          const totalArguments = Object.values(turnData).reduce(
            (total, participantData) =>
              total + participantData.arguments.length,
            0,
          );

          return (
            <AccordionItem
              key={turnNumber}
              value={`turn-${turnNumber}`}
              className="overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-left">
                      Turn {turnNumber}
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      {totalArguments} argument{totalArguments !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      {Object.keys(participantsByRole).length} position
                      {Object.keys(participantsByRole).length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {participantsInOrder.length} participant
                      {participantsInOrder.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-0">
                <div className="space-y-6 pt-2">
                  <div className="space-y-6 px-6">
                    {Object.entries(participantsByRole).map(
                      ([role, roleParticipants]) => (
                        <Card key={role}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge className={getRoleBadgeColor(role)}>
                                  {getRoleDisplayName(role)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {roleParticipants.length} participant
                                  {roleParticipants.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {roleParticipants.reduce(
                                  (total, participant) =>
                                    total +
                                    turnData[participant.id].arguments.length,
                                  0,
                                )}{" "}
                                argument
                                {roleParticipants.reduce(
                                  (total, participant) =>
                                    total +
                                    turnData[participant.id].arguments.length,
                                  0,
                                ) !== 1
                                  ? "s"
                                  : ""}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {roleParticipants.map((participant) => {
                              const participantData = turnData[participant.id];
                              if (!participantData) return null;

                              return (
                                <div
                                  key={participant.id}
                                  className="border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent"
                                >
                                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          participant.user.image || undefined
                                        }
                                      />
                                      <AvatarFallback>
                                        {participant.user.name?.charAt(0) ||
                                          "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {participant.user.name ||
                                          participant.user.email}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {participantData.arguments.length}{" "}
                                        argument
                                        {participantData.arguments.length !== 1
                                          ? "s"
                                          : ""}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 mt-3 ml-2">
                                    {participantData.arguments.map(
                                      (argument, argumentIndex) => (
                                        <div
                                          key={argument.id}
                                          className={cn(
                                            "rounded-md p-3 transition-colors",
                                            argumentIndex === 0
                                              ? "bg-muted/20"
                                              : "bg-muted/10",
                                          )}
                                        >
                                          <SingleArgument
                                            argument={argument}
                                            debate={debate}
                                            isFirstInGroup={argumentIndex === 0}
                                            currentUserId={currentUserId}
                                            onVote={onVote}
                                            onNavigateToArgument={
                                              handleNavigateToArgument
                                            }
                                            onReply={onReply}
                                          />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {turnNumbers.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No arguments submitted yet. Be the first to start the debate!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
