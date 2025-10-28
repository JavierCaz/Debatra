import { format } from "date-fns";
import { Calendar, Clock, FileText, Target, Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebateWithDetails } from "@/types/debate";

interface DebateMetadataProps {
  debate: DebateWithDetails;
}

export function DebateMetadata({ debate }: DebateMetadataProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "OPEN":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "ONE_VS_ONE":
        return "1v1";
      case "ONE_VS_MANY":
        return "1 vs Many";
      case "MULTI_SIDED":
        return "Multi-sided";
      default:
        return format;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">{debate.title}</CardTitle>
            <Badge className={getStatusColor(debate.status)}>
              {debate.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Creator Info */}
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={debate.creator.image || undefined} />
            <AvatarFallback>
              {debate.creator.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Created by</p>
            <p className="text-sm text-muted-foreground">
              {debate.creator.name || debate.creator.email}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{debate.description}</p>
        </div>

        {/* Topic */}
        <div className="flex items-start space-x-2">
          <Target className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Topic</p>
            <p className="text-sm text-muted-foreground">{debate.topic}</p>
          </div>
        </div>

        {/* Debate Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Format</p>
              <p className="text-sm text-muted-foreground">
                {getFormatLabel(debate.format)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Participants</p>
              <p className="text-sm text-muted-foreground">
                Max {debate.maxParticipants}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Turns per side</p>
              <p className="text-sm text-muted-foreground">
                {debate.turnsPerSide}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Time limit</p>
              <p className="text-sm text-muted-foreground">
                {debate.turnTimeLimit ? `${debate.turnTimeLimit}h` : "No limit"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Min. references</p>
              <p className="text-sm text-muted-foreground">
                {debate.minReferences}
              </p>
            </div>
          </div>

          {debate.winCondition && (
            <div className="flex items-start space-x-2">
              <Trophy className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Win condition</p>
                <p className="text-sm text-muted-foreground">
                  {debate.winCondition.type.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(debate.createdAt), "PPp")}
              </p>
            </div>
          </div>

          {debate.startedAt && (
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Started</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(debate.startedAt), "PPp")}
                </p>
              </div>
            </div>
          )}

          {debate.completedAt && (
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(debate.completedAt), "PPp")}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
