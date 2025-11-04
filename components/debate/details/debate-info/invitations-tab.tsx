import { formatDistanceToNow } from "date-fns";
import { Search, UserPlus, Users, X } from "lucide-react";
import type { User } from "@/app/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExtendedRequest } from "@/types/debate-requests";

interface InvitationsTabProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: User[];
  isSearching: boolean;
  selectedRole: string;
  onSendInvitation: (email: string) => void;
  pendingInvitations: ExtendedRequest[];
  onCancelRequest: (requestId: string) => void;
  isLoading: boolean;
}

export function InvitationsTab({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  selectedRole,
  onSendInvitation,
  pendingInvitations,
  onCancelRequest,
  isLoading,
}: InvitationsTabProps) {
  return (
    <>
      {/* Search Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Invite Users</h4>

        <div className="flex gap-2">
          <Input
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Search Results Area */}
        <div className="min-h-[100px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Searching users...
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Search Results</h5>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => onSendInvitation(user.email)}
                    disabled={isLoading}
                    title={`Invite as ${selectedRole.toLowerCase()}`}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching && searchResults.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching by email address
              </p>
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-4">
              <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Start typing to search for users
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Pending Invitations</h4>
        {pendingInvitations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending invitations
          </p>
        ) : (
          pendingInvitations.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={request.user.image || ""} />
                  <AvatarFallback>
                    {request.user.name?.charAt(0) ||
                      request.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {request.user.name || request.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invited as {request.role.toLowerCase()}
                  </p>
                  {request.message && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sent{" "}
                    {formatDistanceToNow(new Date(request.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                      <p>Cancel invitation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
