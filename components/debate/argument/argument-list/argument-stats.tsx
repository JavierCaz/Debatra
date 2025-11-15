import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { DebateWithDetails } from "@/types/debate";

interface ArgumentStatsProps {
  votes: DebateWithDetails["participants"][0]["arguments"][0]["votes"];
}

export function ArgumentStats({ votes }: ArgumentStatsProps) {
  const upvotes = votes.filter((v) => v.support === true).length;
  const downvotes = votes.filter((v) => v.support === false).length;
  const netVotes = upvotes - downvotes;

  return (
    <div className="flex items-center space-x-2">
      {netVotes >= 0 ? (
        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
          <ThumbsUp className="w-4 h-4" />
          <span>{netVotes}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
          <ThumbsDown className="w-4 h-4" />
          <span>{Math.abs(netVotes)}</span>
        </div>
      )}
    </div>
  );
}
