// components/debate/browse/debate-card.tsx
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
              </CardTitle>{" "}
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
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={debate.creator.image || undefined} />
                  <AvatarFallback>
                    {debate.creator.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{debate.creator.name || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{debate._count.participants} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{debate._count.arguments} arguments</span>
              </div>
            </div>
            <span>
              {formatDistanceToNow(new Date(debate.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
