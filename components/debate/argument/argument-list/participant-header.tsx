import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRoleBadgeColor } from "@/lib/debate/formatters";
import type { DebateWithDetails } from "@/types/debate";

interface ParticipantHeaderProps {
  participant: DebateWithDetails["participants"][0];
  argumentsCount: number;
}

export function ParticipantHeader({
  participant,
  argumentsCount,
}: ParticipantHeaderProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
      <Avatar>
        <AvatarImage src={participant.user.image || undefined} />
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
              <Badge className={getRoleBadgeColor(participant.role)}>
                {participant.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {argumentsCount} argument(s) this turn
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
