// components/debate/arguments-list.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getParticipantsInOrder,
  type groupArgumentsByTurn,
} from "@/lib/debate/stats";
import { ParticipantHeader } from "./participant-header";
import { SingleArgument } from "./single-argument";

interface ArgumentsListProps {
  argumentsByTurn: ReturnType<typeof groupArgumentsByTurn>;
  turnNumbers: number[];
}

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
                <div>
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
                <Badge variant="secondary">Turn {turnNumber}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {participantsInOrder.map((participant) => {
                const participantData = turnData[participant.id];
                if (!participantData) return null;

                return (
                  <div key={participant.id} className="space-y-4">
                    <ParticipantHeader
                      participant={participant}
                      argumentsCount={participantData.arguments.length}
                    />

                    {/* Multiple Arguments for this Participant */}
                    <div className="space-y-4 ml-4">
                      {participantData.arguments.map(
                        (argument, argumentIndex) => (
                          <SingleArgument
                            key={argument.id}
                            argument={argument}
                            isFirstInGroup={argumentIndex === 0}
                          />
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
