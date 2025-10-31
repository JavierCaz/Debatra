import type { ParticipantRole } from "@prisma";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JoinRequestProps {
  selectedRole: ParticipantRole;
  onJoinRequest: () => void;
  isLoading: boolean;
  isRoleTaken: boolean;
}

export function JoinRequest({
  selectedRole,
  onJoinRequest,
  isLoading,
  isRoleTaken,
}: JoinRequestProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Join this Debate</h4>
      </div>
      <Button
        onClick={onJoinRequest}
        disabled={isLoading || isRoleTaken}
        className="w-full"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Request to Join as {selectedRole.toLowerCase()}
      </Button>
    </div>
  );
}
