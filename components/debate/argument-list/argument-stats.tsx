import { MessageSquareReply, ThumbsDown, ThumbsUp } from "lucide-react";
import type { DebateWithDetails } from "@/types/debate";

interface ArgumentStatsProps {
  votes: DebateWithDetails["participants"][0]["arguments"][0]["votes"];
  rebuttalsCount: number;
}

export function ArgumentStats({ votes, rebuttalsCount }: ArgumentStatsProps) {
  const upvotes = votes.filter((v) => v.type === "UPVOTE").length;
  const downvotes = votes.filter((v) => v.type === "DOWNVOTE").length;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
        <ThumbsUp className="w-3 h-3" />
        <span>{upvotes}</span>
      </div>
      <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
        <ThumbsDown className="w-3 h-3" />
        <span>{downvotes}</span>
      </div>
      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
        <MessageSquareReply className="w-3 h-3" />
        <span>{rebuttalsCount}</span>
      </div>
    </div>
  );
}
