"use client";

import { ParticipantRole, type User } from "@prisma";
import { Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  cancelRequest,
  getPendingRequests,
  respondToRequest,
  sendInvitation,
  sendJoinRequest,
} from "@/app/actions/debate-request";
import { searchUsers } from "@/app/actions/users";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebateTopic, DebateWithDetails } from "@/types/debate";
import { getTopicDisplayName } from "@/types/debate";
import type { ExtendedRequest } from "@/types/debate-requests";
import { CreatorInviterSections } from "./creator-inviter";
import { CurrentParticipants } from "./current-participants";
import { DebateMetadata } from "./debate-metadata";
import { JoinRequest } from "./join-request";
import { RoleSelection } from "./role-selection";
import { StatusSummary } from "./status-summary";
import { UserRequestsSection } from "./user-requests";

interface DebateInfoProps {
  debate: DebateWithDetails;
  currentTurn: number;
  debateProgress: number;
  totalPossibleTurns: number;
}

export function DebateInfo({
  debate,
  currentTurn,
  debateProgress,
  totalPossibleTurns,
}: DebateInfoProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ExtendedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const currentUser = session?.user;
  const isCreator = debate.creatorId === currentUser?.id;
  const isParticipant = debate.participants.some(
    (p) => p.userId === currentUser?.id,
  );
  const canJoin = !isCreator && !isParticipant && debate.status === "OPEN";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "OPEN":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Role availability logic
  const isProposerTaken = debate.participants.some(
    (p) => p.role === ParticipantRole.PROPOSER,
  );
  const isOpposerTaken = debate.participants.some(
    (p) => p.role === ParticipantRole.OPPOSER,
  );

  const availableRoles = useMemo(
    () => [
      {
        value: ParticipantRole.PROPOSER,
        label: "Proposer",
        taken: isProposerTaken,
      },
      {
        value: ParticipantRole.OPPOSER,
        label: "Opposer",
        taken: isOpposerTaken,
      },
    ],
    [isProposerTaken, isOpposerTaken],
  );

  const getDefaultSelectedRole = () => {
    const available = availableRoles.find((role) => !role.taken);
    return available ? available.value : ParticipantRole.PROPOSER;
  };

  const [selectedRole, setSelectedRole] = useState<ParticipantRole>(
    getDefaultSelectedRole,
  );

  useEffect(() => {
    if (availableRoles.find((role) => role.value === selectedRole)?.taken) {
      const available = availableRoles.find((role) => !role.taken);
      if (available) {
        setSelectedRole(available.value);
      }
    }
  }, [availableRoles, selectedRole]);

  const fetchPendingRequests = useCallback(async () => {
    if (!currentUser?.email) return;

    try {
      const result = await getPendingRequests(debate.id);
      if (result.requests) {
        setPendingRequests(result.requests as ExtendedRequest[]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [debate.id, currentUser?.email]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchUsers(query);
        if (response.users) {
          const filteredUsers = response.users.filter(
            (user: User) =>
              !debate.participants.some((p) => p.userId === user.id) &&
              user.id !== debate.creatorId,
          );
          setSearchResults(filteredUsers);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [debate.participants, debate.creatorId],
  );

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  // Action handlers
  const handleSendInvitation = async (userEmail: string) => {
    if (!currentUser?.email) return;

    setIsLoading(true);
    try {
      const result = await sendInvitation(debate.id, userEmail, selectedRole);
      if (result.success) {
        setSearchQuery("");
        setSearchResults([]);
        await fetchPendingRequests();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!currentUser?.email) return;

    setIsLoading(true);
    try {
      const result = await sendJoinRequest(debate.id, selectedRole);
      if (result.success) {
        await fetchPendingRequests();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      alert("Failed to send join request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    setIsLoading(true);
    try {
      const result = await respondToRequest(requestId, accept);
      if (result.success) {
        await fetchPendingRequests();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to respond to request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const result = await cancelRequest(requestId);
      if (result.success) {
        await fetchPendingRequests();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Please sign in to interact with this debate
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">{debate.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(debate.status)}>
                {debate.status.replace("_", " ")}
              </Badge>
              {/* Topics Badges */}
              {debate.topics.map(({ topic }) => (
                <Badge key={topic} variant="secondary">
                  {getTopicDisplayName(topic as DebateTopic)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metadata Section */}
        <DebateMetadata
          debate={debate}
          currentTurn={currentTurn}
          debateProgress={debateProgress}
          totalPossibleTurns={totalPossibleTurns}
        />

        {/* Participants Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Debate Participants</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Manage invitations and join requests for this debate
          </p>

          <div className="space-y-6">
            <CurrentParticipants debate={debate} />

            {(debate.status === "IN_PROGRESS" ||
              debate.status === "COMPLETED") && (
              <StatusSummary debate={debate} />
            )}

            {debate.participants.length < debate.maxParticipants ? (
              <>
                <RoleSelection
                  availableRoles={availableRoles}
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />

                {canJoin && (
                  <JoinRequest
                    selectedRole={selectedRole}
                    onJoinRequest={handleJoinRequest}
                    isLoading={isLoading}
                    isRoleTaken={
                      availableRoles.find((r) => r.value === selectedRole)
                        ?.taken || false
                    }
                  />
                )}

                {isCreator && (
                  <CreatorInviterSections
                    pendingRequests={pendingRequests}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    selectedRole={selectedRole}
                    onSendInvitation={handleSendInvitation}
                    onRespondToRequest={handleRespondToRequest}
                    onCancelRequest={handleCancelRequest}
                    isLoading={isLoading}
                  />
                )}

                {!isCreator &&
                  pendingRequests.filter((r) => r.userId === currentUser.id)
                    .length > 0 && (
                    <UserRequestsSection
                      pendingRequests={pendingRequests}
                      currentUserId={currentUser.id}
                      onRespondToRequest={handleRespondToRequest}
                      onCancelRequest={handleCancelRequest}
                      isLoading={isLoading}
                    />
                  )}
              </>
            ) : (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  This debate has reached the maximum number of participants (
                  {debate.maxParticipants})
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
