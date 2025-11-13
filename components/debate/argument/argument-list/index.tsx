"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/debate/formatters";
import {
  getParticipantsInOrder,
  type groupArgumentsByTurn,
} from "@/lib/debate/stats";
import { cn } from "@/lib/utils";
import { SingleArgument } from "./single-argument";

interface ArgumentsListProps {
  argumentsByTurn: ReturnType<typeof groupArgumentsByTurn>;
  turnNumbers: number[];
  currentUserId?: string;
  onVote?: (argumentId: string, support: boolean) => void;
}

export function ArgumentsList({
  argumentsByTurn,
  turnNumbers,
  currentUserId,
  onVote,
}: ArgumentsListProps) {
  return (
    <div className="space-y-8">
      {/* Arguments by Turn */}
      {turnNumbers.map((turnNumber) => {
        const turnData = argumentsByTurn[turnNumber];
        const participantsInOrder = getParticipantsInOrder(turnData);

        // Group participants by role
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

        return (
          <div key={turnNumber} className="space-y-6">
            {/* Turn Header with Separator */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative bg-background px-4">
                <h3 className="text-lg font-semibold bg-background px-4 py-1 rounded-lg">
                  Turn {turnNumber}
                </h3>
              </div>
            </div>

            {/* Cards by Role */}
            <div className="space-y-6">
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
                            {roleParticipants.length} participant(s)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {roleParticipants.reduce(
                            (total, participant) =>
                              total + turnData[participant.id].arguments.length,
                            0,
                          )}{" "}
                          argument(s)
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
                            {/* Participant Header */}
                            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                              <Avatar>
                                <AvatarImage
                                  src={participant.user.image || undefined}
                                />
                                <AvatarFallback>
                                  {participant.user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {participant.user.name ||
                                    participant.user.email}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {participantData.arguments.length} argument(s)
                                </p>
                              </div>
                            </div>

                            {/* Multiple Arguments for this Participant */}
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
                                      isFirstInGroup={argumentIndex === 0}
                                      currentUserId={currentUserId}
                                      onVote={onVote}
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
        );
      })}

      {/* Show empty state if no arguments at all */}
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
