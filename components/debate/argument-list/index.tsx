"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getParticipantsInOrder,
  type groupArgumentsByTurn,
} from "@/lib/debate/stats";
import { cn } from "@/lib/utils";
import { SingleArgument } from "./single-argument";

interface ArgumentsListProps {
  argumentsByTurn: ReturnType<typeof groupArgumentsByTurn>;
  turnNumbers: number[];
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "PROPOSER":
      return "bg-green-500";
    case "OPPOSER":
      return "bg-red-500";
    case "NEUTRAL":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export function ArgumentsList({
  argumentsByTurn,
  turnNumbers,
}: ArgumentsListProps) {
  return (
    <div className="space-y-6">
      {/* Arguments by Turn */}
      {turnNumbers.map((turnNumber) => {
        const turnData = argumentsByTurn[turnNumber];
        const participantsInOrder = getParticipantsInOrder(turnData);

        return (
          <Card key={turnNumber}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Turn {turnNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {Object.values(turnData).reduce(
                    (total, participantData) =>
                      total + participantData.arguments.length,
                    0,
                  )}{" "}
                  argument(s) across {Object.keys(turnData).length}{" "}
                  participant(s)
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {participantsInOrder.map((participant) => {
                const participantData = turnData[participant.id];
                if (!participantData) return null;

                return (
                  <div
                    key={participant.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent"
                  >
                    {/* Participant Header */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar>
                        <AvatarImage
                          src={participant.user.image || undefined}
                        />
                        <AvatarFallback>
                          {participant.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {participant.user.name || participant.user.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                className={getRoleBadgeColor(participant.role)}
                              >
                                {participant.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {participantData.arguments.length} argument(s)
                                this turn
                              </span>
                            </div>
                          </div>
                        </div>
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
