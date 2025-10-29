import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import type { DebateTopicEnum } from "@/app/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type DebateTopic, getTopicDisplayName } from "@/types/debate";

interface DebateCardProps {
  debate: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    creator: {
      name: string | null;
      image: string | null;
    };
    topics: {
      topic: DebateTopicEnum;
    }[];
    _count: {
      arguments: number;
      participants: number;
    };
  };
}

const statusColors = {
  DRAFT: "bg-gray-500",
  OPEN: "bg-green-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-red-500",
};

const statusLabels = {
  DRAFT: "Draft",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function DebateCard({ debate }: DebateCardProps) {
  // Limit displayed topics to prevent overflow
  const displayTopics = debate.topics.slice(0, 3);
  const hasMoreTopics = debate.topics.length > 3;

  return (
    <Link href={`/debates/${debate.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-3 line-clamp-2">
                {debate.title}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                {/* Status Badge */}
                <Badge
                  className={
                    statusColors[debate.status as keyof typeof statusColors]
                  }
                >
                  {statusLabels[debate.status as keyof typeof statusLabels]}
                </Badge>

                {/* Topics Badges - removed max-width and truncate */}
                {displayTopics.map(({ topic }) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="whitespace-normal break-words"
                  >
                    {getTopicDisplayName(topic as DebateTopic)}
                  </Badge>
                ))}

                {/* Show "+X more" if there are additional topics */}
                {hasMoreTopics && (
                  <Badge variant="outline" className="text-xs">
                    +{debate.topics.length - 3} more
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
            {/* Left side - User info and stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarImage src={debate.creator.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {debate.creator.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm">
                  {debate.creator.name || "Anonymous"}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {debate._count.participants}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {debate._count.arguments}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Timestamp */}
            <div className="flex justify-end">
              <span className="text-xs sm:text-sm bg-muted px-2 py-1 rounded-md sm:bg-transparent sm:px-0 sm:py-0">
                {formatDistanceToNow(new Date(debate.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
