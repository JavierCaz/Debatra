import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExtendedRequest } from "@/types/debate-requests";

interface UserRequestsSectionProps {
  pendingRequests: ExtendedRequest[];
  currentUserId: string;
  onRespondToRequest: (requestId: string, accept: boolean) => void;
  onCancelRequest: (requestId: string) => void;
  isLoading: boolean;
}

export function UserRequestsSection({
  pendingRequests,
  currentUserId,
  onRespondToRequest,
  onCancelRequest,
  isLoading,
}: UserRequestsSectionProps) {
  const userRequests = pendingRequests.filter(
    (r) => r.userId === currentUserId,
  );

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Your Requests</h4>
      {userRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={request.inviter?.image || ""} />
              <AvatarFallback>
                {request.inviter?.name?.charAt(0) ||
                  request.inviter?.email.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {request.type === "JOIN_REQUEST"
                  ? "Join Request"
                  : `Invitation from ${request.inviter?.name || request.inviter?.email || "someone"}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Role: {request.role.toLowerCase()} • Status:{" "}
                {request.status.toLowerCase()}
              </p>
              {request.message && (
                <p className="text-xs text-muted-foreground mt-1">
                  {request.message}
                </p>
              )}
            </div>
          </div>
          {request.status === "PENDING" && (
            <div className="flex gap-2">
              {request.type === "INVITATION" ? (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => onRespondToRequest(request.id, true)}
                          disabled={isLoading}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Accept invitation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRespondToRequest(request.id, false)}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Decline invitation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancelRequest(request.id)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel request</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
