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
  currentTurn: number;
  totalPossibleTurns: number;
}

// Helper function to safely render HTML content
const SafeContentRenderer = ({ content }: { content: string }) => {
  // Simple HTML tag stripper - remove all HTML tags and decode entities
  const stripHtml = (html: string): string => {
    if (typeof window === "undefined") {
      // Server-side: basic replacement
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    // Client-side: use DOM parser for better accuracy
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Format plain text with basic structure preservation
  const formatPlainText = (text: string): string => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");
  };

  const plainText = formatPlainText(stripHtml(content));

  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {plainText}
    </div>
  );
};

// Helper to extract plain text for previews
const getPlainTextPreview = (
  content: string,
  maxLength: number = 200,
): string => {
  const stripped = content.replace(/<[^>]*>/g, "");
  const decoded = stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  if (decoded.length <= maxLength) return decoded;
  return decoded.substring(0, maxLength) + "...";
};

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

  // Create a map to quickly find arguments by ID for rebuttal relationships
  const argumentMap = new Map();
  debate.participants.forEach((participant) => {
    participant.arguments.forEach((argument) => {
      argumentMap.set(argument.id, { argument, participant });
    });
  });

  // Group arguments by turn number and participant
  const argumentsByTurn = debate.participants.reduce(
    (acc, participant) => {
      participant.arguments.forEach((argument) => {
        const turnNumber = argument.turnNumber;
        if (!acc[turnNumber]) {
          acc[turnNumber] = {};
        }
        if (!acc[turnNumber][participant.id]) {
          acc[turnNumber][participant.id] = {
            participant,
            arguments: [],
          };
        }
        acc[turnNumber][participant.id].arguments.push(argument);
      });
      return acc;
    },
    {} as Record<
      number,
      Record<
        string,
        {
          participant: (typeof debate.participants)[0];
          arguments: (typeof debate.participants)[0]["arguments"];
        }
      >
    >,
  );

  // Sort arguments within each participant by creation time
  Object.keys(argumentsByTurn).forEach((turnNumber) => {
    const turn = argumentsByTurn[Number(turnNumber)];
    Object.keys(turn).forEach((participantId) => {
      turn[participantId].arguments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  });

  // Get all turn numbers and sort them
  const turnNumbers = Object.keys(argumentsByTurn)
    .map(Number)
    .sort((a, b) => a - b);

  // Get the participant display order for each turn (Proposer first, then Opposer, then Neutral)
  const getParticipantsInOrder = (
    turnData: (typeof argumentsByTurn)[number],
  ) => {
    const participants = Object.values(turnData).map(
      (item) => item.participant,
    );
    return participants.sort((a, b) => {
      const roleOrder = { PROPOSER: 0, OPPOSER: 1, NEUTRAL: 2 };
      return roleOrder[a.role] - roleOrder[b.role];
    });
  };

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
                    <div className="space-y-4 ml-4">
                      {participantData.arguments.map(
                        (argument, argumentIndex) => (
                          <div key={argument.id} className="space-y-3">
                            {argumentIndex > 0 && <Separator />}

                            {/* Rebuttal Indicator */}
                            {argument.rebuttalTo && (
                              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                                  <Reply className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Rebutting{" "}
                                    {argument.rebuttalTo.participant.user
                                      .name ||
                                      argument.rebuttalTo.participant.user
                                        .email}
                                    's argument from Turn{" "}
                                    {argument.rebuttalTo.turnNumber}
                                  </span>
                                </div>
                                {argument.rebuttalTo.content && (
                                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-muted-foreground">
                                    <p className="line-clamp-2 italic">
                                      "
                                      {getPlainTextPreview(
                                        argument.rebuttalTo.content,
                                      )}
                                      "
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Argument Content */}
                            <SafeContentRenderer content={argument.content} />

                            {/* Argument Metadata */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {format(new Date(argument.createdAt), "PPp")}
                              </span>

                              {/* Stats and References */}
                              <div className="flex items-center space-x-4">
                                {/* Vote counts */}
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>
                                      {
                                        argument.votes.filter(
                                          (v) => v.type === "UPVOTE",
                                        ).length
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                                    <ThumbsDown className="w-3 h-3" />
                                    <span>
                                      {
                                        argument.votes.filter(
                                          (v) => v.type === "DOWNVOTE",
                                        ).length
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{argument._count.rebuttals}</span>
                                  </div>
                                </div>

                                {/* References count */}
                                {argument.references.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {argument.references.length} reference(s)
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* References */}
                            {argument.references.length > 0 && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <FileText className="w-3 h-3 mr-2" />
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
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
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
