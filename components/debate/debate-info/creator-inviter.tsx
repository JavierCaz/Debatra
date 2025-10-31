import type { User } from "@/app/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExtendedRequest } from "@/types/debate-requests";
import { InvitationsTab } from "./invitations-tab";
import { JoinRequestsTab } from "./join-requests-tab";

interface CreatorInviterSectionsProps {
  pendingRequests: ExtendedRequest[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: User[];
  isSearching: boolean;
  selectedRole: string;
  onSendInvitation: (email: string) => void;
  onRespondToRequest: (requestId: string, accept: boolean) => void;
  onCancelRequest: (requestId: string) => void;
  isLoading: boolean;
}

export function CreatorInviterSections({
  pendingRequests,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  selectedRole,
  onSendInvitation,
  onRespondToRequest,
  onCancelRequest,
  isLoading,
}: CreatorInviterSectionsProps) {
  const joinRequests = pendingRequests.filter((r) => r.type === "JOIN_REQUEST");
  const invitations = pendingRequests.filter((r) => r.type === "INVITATION");

  return (
    <Tabs defaultValue="join" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="join">Requests ({joinRequests.length})</TabsTrigger>
        <TabsTrigger value="invite">
          Invitations ({invitations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="join" className="space-y-4 mt-4">
        <JoinRequestsTab
          joinRequests={joinRequests}
          onRespondToRequest={onRespondToRequest}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="invite" className="space-y-6 mt-4">
        <InvitationsTab
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          searchResults={searchResults}
          isSearching={isSearching}
          selectedRole={selectedRole}
          onSendInvitation={onSendInvitation}
          pendingInvitations={invitations}
          onCancelRequest={onCancelRequest}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
