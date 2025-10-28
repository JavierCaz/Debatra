import { format } from "date-fns";
import {
  ExternalLink,
  FileText,
  MessageSquare,
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

  return (
    <div className="space-y-6">
      {debate.participants.map((participant) => (
        <Card key={participant.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={participant.user.image || undefined} />
                  <AvatarFallback>
                    {participant.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {participant.user.name || participant.user.email}
                  </p>
                  <Badge className={getRoleBadgeColor(participant.role)}>
                    {participant.role}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline">
                {participant.arguments.length} argument(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {participant.arguments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No arguments submitted yet.
              </p>
            ) : (
              <div className="space-y-6">
                {participant.arguments.map((argument, index) => (
                  <div key={argument.id}>
                    {index > 0 && <Separator className="my-6" />}

                    {/* Argument Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          Turn {argument.turnNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(argument.createdAt), "PPp")}
                        </span>
                      </div>

                      {/* Vote counts */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">
                            {
                              argument.votes.filter((v) => v.type === "UPVOTE")
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">
                            {
                              argument.votes.filter(
                                (v) => v.type === "DOWNVOTE",
                              ).length
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
                    </div>

                    {/* Argument Content */}
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {argument.content}
                      </p>
                    </div>

                    {/* References */}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
