import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface VotingButtonsProps {
  itemId: string;
  votes?: {
    support: number;
    oppose: number;
  };
  currentUserId?: string;
  onVote?: (itemId: string, support: boolean) => void;
  size?: "sm" | "lg" | "default";
  orientation?: "horizontal" | "vertical";
}

export function VotingButtons({
  itemId,
  votes,
  currentUserId,
  onVote,
  size = "sm",
  orientation = "horizontal",
}: VotingButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!currentUserId || !onVote) return null;

  const handleVote = async (support: boolean): Promise<void> => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onVote(itemId, support);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    support: boolean,
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      handleVote(support);
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case "sm":
        return "h-8 px-2 text-xs";
      case "lg":
        return "h-10 px-4 text-base";
      default:
        return "h-9 px-3 text-sm";
    }
  };

  const getIconSize = (): string => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  return (
    <div
      className={`flex items-center gap-1 ${orientation === "vertical" ? "flex-col" : "flex-row"}`}
    >
      <Button
        variant="ghost"
        size={size}
        disabled={isSubmitting}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleVote(true);
        }}
        onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, true)}
        className={`gap-1 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20 ${getSizeClasses()}`}
        aria-label={`Support this. Currently has ${votes?.support || 0} supports`}
      >
        <ThumbsUp className={getIconSize()} />
        <span>{votes?.support || 0}</span>
      </Button>
      <Button
        variant="ghost"
        size={size}
        disabled={isSubmitting}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleVote(false);
        }}
        onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, false)}
        className={`gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 ${getSizeClasses()}`}
        aria-label={`Oppose this. Currently has ${votes?.oppose || 0} opposes`}
      >
        <ThumbsDown className={getIconSize()} />
        <span>{votes?.oppose || 0}</span>
      </Button>
    </div>
  );
}
