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

interface JoinRequestsTabProps {
  joinRequests: ExtendedRequest[];
  onRespondToRequest: (requestId: string, accept: boolean) => void;
  isLoading: boolean;
}

export function JoinRequestsTab({
  joinRequests,
  onRespondToRequest,
  isLoading,
}: JoinRequestsTabProps) {
  return (
    <>
      <h4 className="text-sm font-medium">Pending Join Requests</h4>
      {joinRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No pending join requests
        </p>
      ) : (
        joinRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={request.user.image || ""} />
                <AvatarFallback>
                  {request.user.name?.charAt(0) || request.user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {request.user.name || request.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Wants to join as {request.role.toLowerCase()}
                </p>
                {request.message && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.message}
                  </p>
                )}
              </div>
            </div>
            <TooltipProvider>
              <div className="flex gap-2">
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
                    <p>Accept request</p>
                  </TooltipContent>
                </Tooltip>

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
                    <p>Decline request</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ))
      )}
    </>
  );
}
