import type { ParticipantRole } from "@prisma";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/ui/translated-text";

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
        <h4 className="text-sm font-medium">
          <T k="debate.info.joinDebate" />
        </h4>
      </div>
      <Button
        onClick={onJoinRequest}
        disabled={isLoading || isRoleTaken}
        className="w-full"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        <T
          k="debate.info.requestToJoin"
          values={{ role: selectedRole.toLowerCase() }}
        />
      </Button>
    </div>
  );
}
