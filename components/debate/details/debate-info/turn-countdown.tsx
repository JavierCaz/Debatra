"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TurnCountdownProps {
  lastArgumentTime: Date | null;
  turnTimeLimitHours: number | null;
  canSubmitArguments: boolean;
}

export function TurnCountdown({
  lastArgumentTime,
  turnTimeLimitHours,
  canSubmitArguments,
}: TurnCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // If no time limit or no last argument time, don't run countdown
    if (!turnTimeLimitHours || !lastArgumentTime) {
      setTimeRemaining(0);
      setIsExpired(false);
      return;
    }

    const calculateTimeRemaining = () => {
      const deadline = new Date(
        new Date(lastArgumentTime).getTime() +
          turnTimeLimitHours * 60 * 60 * 1000,
      );
      const now = new Date();
      const remaining = deadline.getTime() - now.getTime();

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
      } else {
        setIsExpired(false);
        setTimeRemaining(remaining);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [lastArgumentTime, turnTimeLimitHours]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getColorClass = () => {
    if (!turnTimeLimitHours) return "secondary";

    const hoursRemaining = timeRemaining / (1000 * 60 * 60);

    if (isExpired) return "destructive";
    if (hoursRemaining < 1) return "destructive";
    if (hoursRemaining < 6) return "default";
    return "secondary";
  };

  const isUrgent = timeRemaining < 6 * 60 * 60 * 1000 && !isExpired;

  // No time limit set
  if (!turnTimeLimitHours) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No time limit</span>
      </div>
    );
  }

  // No last argument time (debate just started)
  if (!lastArgumentTime) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Turn starts soon</span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {canSubmitArguments
            ? "Your time has expired! You may forfeit this turn soon."
            : "Opponent's time has expired! They may forfeit this turn soon."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Turn countdown:</span>
        <Badge
          variant={getColorClass()}
          className={
            isUrgent
              ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800"
              : ""
          }
        >
          {formatTime(timeRemaining)} remaining
        </Badge>
      </div>

      {isUrgent && canSubmitArguments && (
        <Alert
          variant="default"
          className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Hurry! You have less than 6 hours to respond or you may forfeit this
            turn.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
