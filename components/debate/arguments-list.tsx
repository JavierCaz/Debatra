import { format } from "date-fns";
import {
  ExternalLink,
  FileText,
  MessageSquare,
  Reply,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DebateWithDetails } from "@/types/debate";

interface ArgumentsListProps {
  debate: DebateWithDetails;
}

export function ArgumentsList({ debate }: ArgumentsListProps) {
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

  const getReferenceTypeIcon = (_type: string) => {
    return <FileText className="w-3 h-3" />;
  };

  // Group arguments by turn number
  const argumentsByTurn = debate.participants.reduce(
    (acc, participant) => {
      participant.arguments.forEach((argument) => {
        const turnNumber = argument.turnNumber;
        if (!acc[turnNumber]) {
          acc[turnNumber] = [];
        }
        acc[turnNumber].push({
          argument,
          participant,
        });
      });
      return acc;
    },
    {} as Record<
      number,
      Array<{
        argument: (typeof debate.participants)[0]["arguments"][0];
        participant: (typeof debate.participants)[0];
      }>
    >,
  );

  // Sort arguments within each turn by creation time
  Object.keys(argumentsByTurn).forEach((turnNumber) => {
    argumentsByTurn[Number(turnNumber)].sort(
      (a, b) =>
        new Date(a.argument.createdAt).getTime() -
        new Date(b.argument.createdAt).getTime(),
    );
  });

  // Get all turn numbers and sort them
  const turnNumbers = Object.keys(argumentsByTurn)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate debate progress
  const totalPossibleTurns = debate.turnsPerSide * debate.maxParticipants;
  const currentTurn = turnNumbers.length > 0 ? Math.max(...turnNumbers) : 0;
  const debateProgress =
    totalPossibleTurns > 0 ? (currentTurn / totalPossibleTurns) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Debate Progress Indicator */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Debate Progress</h3>
              <p className="text-sm text-muted-foreground">
                Turn {currentTurn} of {totalPossibleTurns}
              </p>
            </div>
            <div className="w-32 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(debateProgress, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arguments by Turn */}
      {turnNumbers.map((turnNumber) => (
        <Card key={turnNumber}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Turn {turnNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {argumentsByTurn[turnNumber].length} argument(s) in this turn
                </p>
              </div>
              <Badge variant="secondary">Turn {turnNumber}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {argumentsByTurn[turnNumber].map(
              ({ argument, participant }, index) => (
                <div key={argument.id}>
                  {index > 0 && <Separator className="my-4" />}

                  {/* Rebuttal Indicator - Updated for dark mode */}
                  {argument.rebuttalTo && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                        <Reply className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Rebutting{" "}
                          {argument.rebuttalTo.participant.user.name ||
                            argument.rebuttalTo.participant.user.email}
                          's argument
                        </span>
                      </div>
                      {argument.rebuttalTo.content && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-muted-foreground">
                          <p className="line-clamp-2 italic">
                            "{argument.rebuttalTo.content.substring(0, 200)}
                            {argument.rebuttalTo.content.length > 200
                              ? "..."
                              : ""}
                            "
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participant Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={participant.user.image || undefined}
                        />
                        <AvatarFallback>
                          {participant.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
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
                          {argument.rebuttalTo && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                            >
                              <Reply className="w-3 h-3 mr-1" />
                              Rebuttal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {format(new Date(argument.createdAt), "PPp")}
                    </span>
                  </div>

                  {/* Argument Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {argument.content}
                    </p>
                  </div>

                  {/* Stats and References */}
                  <div className="flex items-center justify-between">
                    {/* Vote counts */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">
                          {
                            argument.votes.filter((v) => v.type === "UPVOTE")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm">
                          {
                            argument.votes.filter((v) => v.type === "DOWNVOTE")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">
                          {argument._count.rebuttals}
                        </span>
                      </div>
                    </div>

                    {/* References count */}
                    {argument.references.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {argument.references.length} reference(s)
                      </Badge>
                    )}
                  </div>

                  {/* References - Updated for dark mode */}
                  {argument.references.length > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        References ({argument.references.length})
                      </h4>
                      <div className="space-y-2">
                        {argument.references.map((reference) => (
                          <div
                            key={reference.id}
                            className="flex items-start space-x-2 text-sm"
                          >
                            {getReferenceTypeIcon(reference.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {reference.title}
                              </p>
                              {reference.author && (
                                <p className="text-xs text-muted-foreground">
                                  {reference.author}
                                  {reference.publication &&
                                    ` - ${reference.publication}`}
                                  {reference.publishedAt &&
                                    ` (${format(new Date(reference.publishedAt), "yyyy")})`}
                                </p>
                              )}
                              {reference.url && (
                                <a
                                  href={reference.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center mt-1"
                                >
                                  View source
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                              {reference.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  Note: {reference.notes}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {reference.type.replace("_", " ")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </CardContent>
        </Card>
      ))}

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
