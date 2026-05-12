"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { T } from "@/components/ui/translated-text";

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

  const getUrgentThreshold = () => {
    if (!turnTimeLimitHours) return 0;
    return turnTimeLimitHours * 60 * 60 * 1000 * 0.3; // 30% of total time
  };

  const getCriticalThreshold = () => {
    if (!turnTimeLimitHours) return 0;
    return turnTimeLimitHours * 60 * 60 * 1000 * 0.1; // 10% of total time
  };

  const getColorClass = () => {
    if (!turnTimeLimitHours) return "secondary";

    if (isExpired) return "destructive";
    if (timeRemaining < getCriticalThreshold()) return "destructive";
    if (timeRemaining < getUrgentThreshold()) return "default";
    return "secondary";
  };

  const isUrgent = timeRemaining < getUrgentThreshold() && !isExpired;
  const isCritical = timeRemaining < getCriticalThreshold() && !isExpired;

  const getUrgentMessage = () => {
    if (!turnTimeLimitHours) return null;

    return (
      <T
        k="debate.status.hurryRespond"
        values={{ time: formatTime(timeRemaining) }}
      />
    );
  };

  if (!turnTimeLimitHours) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          <T k="debate.status.noTimeLimit" />
        </span>
      </div>
    );
  }

  if (!lastArgumentTime) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          <T k="debate.status.turnStartsSoon" />
        </span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {canSubmitArguments ? (
            <T k="debate.status.yourTimeExpired" />
          ) : (
            <T k="debate.status.opponentTimeExpired" />
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          <T k="debate.status.turnCountdown" />
        </span>
        <Badge
          variant={getColorClass()}
          className={
            isUrgent
              ? isCritical
                ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800"
                : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800"
              : ""
          }
        >
          <T
            k="debate.status.timeRemaining"
            values={{ time: formatTime(timeRemaining) }}
          />
        </Badge>
      </div>

      {isUrgent && canSubmitArguments && (
        <Alert
          variant="default"
          className={
            isCritical
              ? "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800"
              : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800"
          }
        >
          <AlertTriangle
            className={
              isCritical
                ? "h-4 w-4 text-red-600 dark:text-red-400"
                : "h-4 w-4 text-yellow-600 dark:text-yellow-400"
            }
          />
          <AlertDescription
            className={
              isCritical
                ? "text-red-800 dark:text-red-200"
                : "text-yellow-800 dark:text-yellow-200"
            }
          >
            {isCritical ? (
              <T
                k="debate.status.criticalTime"
                values={{ time: formatTime(timeRemaining) }}
              />
            ) : (
              getUrgentMessage()
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
