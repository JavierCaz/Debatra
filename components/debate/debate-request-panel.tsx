"use client";

import {
  type Debate,
  type DebateRequest,
  DebateStatus,
  ParticipantRole,
  type User,
} from "@prisma";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckCircle,
  Clock,
  Search,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface DebateRequestsPanelProps {
  debate: Debate & {
    creator: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    participants: Array<{
      userId: string;
      role: ParticipantRole;
      user: {
        id: string;
        name: string | null;
        image: string | null;
        email: string;
      };
      arguments?: Array<{
        id: string;
        turnNumber: number;
      }>;
    }>;
  } & {
    winCondition?: {
      id: string;
      type: string;
      description: string | null;
      debateId: string;
      winnerId: string | null;
      decidedAt: Date | null;
    } | null;
    currentTurnSide: ParticipantRole;
    currentTurnNumber: number;
  };
}

type ExtendedRequest = DebateRequest & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  inviter?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function DebateRequestsPanel({ debate }: DebateRequestsPanelProps) {
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

  // Send invitation
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

  // Send join request
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

  // Respond to request
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

  // Cancel request
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
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Debate Participants
        </CardTitle>
        <CardDescription>
          Manage invitations and join requests for this debate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Participants */}
        <div>
          <h4 className="text-sm font-medium mb-3">Current Participants</h4>
          <div className="space-y-3">
            {/* Participants */}
            {debate.participants.map((participant) => {
              // Check if this participant has already argued in the current turn
              const hasParticipatedInCurrentTurn = participant.arguments?.some(
                (argument) => argument.turnNumber === debate.currentTurnNumber,
              );

              const isCurrentTurn =
                debate.status === "IN_PROGRESS" &&
                debate.currentTurnSide === participant.role &&
                !hasParticipatedInCurrentTurn;

              const isWinner =
                debate.status === "COMPLETED" &&
                debate.winCondition?.winnerId === participant.userId;

              return (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.user.image || ""} />
                      <AvatarFallback>
                        {participant.user.name?.charAt(0) ||
                          participant.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {participant.user.name || participant.user.email}
                        <Badge
                          variant={
                            participant.role === "PROPOSER"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {participant.role.toLowerCase()}
                          {hasParticipatedInCurrentTurn && " (Done)"}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasParticipatedInCurrentTurn && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {isCurrentTurn && (
                      <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
                    )}
                    {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              );
            })}

            {debate.participants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No participants yet. Invite users to join the debate.
              </p>
            )}
          </div>
        </div>
        {/* Debate Status Summary */}
        {(debate.status === "IN_PROGRESS" || debate.status === "COMPLETED") && (
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              {debate.status === "IN_PROGRESS" && (
                <>
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Debate in Progress</span>
                  <span className="text-muted-foreground">
                    • Turn {debate.currentTurnNumber || 1} (
                    {debate.currentTurnSide?.toLowerCase() || "proposer"}'s
                    turn)
                  </span>
                </>
              )}
              {debate.status === "COMPLETED" && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Debate Completed</span>
                  {debate.winCondition && (
                    <span className="text-muted-foreground">
                      •{" "}
                      {debate.winCondition.type.toLowerCase().replace("_", " ")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {/* Role Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3">Available Roles</h4>
          <RadioGroup
            value={selectedRole}
            onValueChange={(value: "PROPOSER" | "OPPOSER") =>
              setSelectedRole(value)
            }
            className="flex gap-2"
          >
            {availableRoles.map((role) => (
              <div key={role.value} className="flex-1">
                <RadioGroupItem
                  value={role.value}
                  id={`role-${role.value}`}
                  disabled={role.taken}
                  className="sr-only"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={`role-${role.value}`}
                        className={`
                  flex flex-col items-center justify-center rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all
                  whitespace-nowrap min-h-[2.5rem]
                  ${
                    selectedRole === role.value && !role.taken
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-popover hover:bg-accent"
                  }
                  ${
                    role.taken
                      ? "opacity-50 cursor-not-allowed border-dashed"
                      : "cursor-pointer"
                  }
                `}
                      >
                        <span>{role.label}</span>
                      </Label>
                    </TooltipTrigger>
                    {role.taken && (
                      <TooltipContent>
                        <p>This role is already taken</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Join Request Section for Non-Creators */}
        {canJoin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Join this Debate</h4>
              <Badge variant="outline">{selectedRole}</Badge>
            </div>
            <Button
              onClick={handleJoinRequest}
              disabled={
                isLoading ||
                availableRoles.find((r) => r.value === selectedRole)?.taken
              }
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Request to Join as {selectedRole.toLowerCase()}
            </Button>
          </div>
        )}

        {/* Creator/Inviter Sections */}
        {isCreator && (
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">
                Requests (
                {
                  pendingRequests.filter((r) => r.type === "JOIN_REQUEST")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="invite">
                Invitations (
                {pendingRequests.filter((r) => r.type === "INVITATION").length})
              </TabsTrigger>
            </TabsList>

            {/* Join Requests Tab */}
            <TabsContent value="join" className="space-y-4 mt-4">
              <h4 className="text-sm font-medium">Pending Join Requests</h4>
              {pendingRequests.filter((r) => r.type === "JOIN_REQUEST")
                .length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending join requests
                </p>
              ) : (
                pendingRequests
                  .filter((r) => r.type === "JOIN_REQUEST")
                  .map((request) => (
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
                                onClick={() =>
                                  handleRespondToRequest(request.id, true)
                                }
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
                                onClick={() =>
                                  handleRespondToRequest(request.id, false)
                                }
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
            </TabsContent>

            {/* Send Invitations Tab */}
            <TabsContent value="invite" className="space-y-6 mt-4">
              {/* Search Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Invite Users</h4>

                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search users by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={() => handleSendInvitation(user.email)}
                            disabled={isLoading}
                            title={`Invite as ${selectedRole.toLowerCase()}`}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : debouncedSearchQuery &&
                    !isSearching &&
                    searchResults.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No users found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try searching by email address
                      </p>
                    </div>
                  ) : !debouncedSearchQuery ? (
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
                {pendingRequests.filter((r) => r.type === "INVITATION")
                  .length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending invitations
                  </p>
                ) : (
                  pendingRequests
                    .filter((r) => r.type === "INVITATION")
                    .map((request) => (
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
                              {formatDistanceToNow(
                                new Date(request.createdAt),
                                { addSuffix: true },
                              )}
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
                                  onClick={() =>
                                    handleCancelRequest(request.id)
                                  }
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
            </TabsContent>
          </Tabs>
        )}

        {/* User's Own Requests */}
        {!isCreator &&
          pendingRequests.filter((r) => r.userId === currentUser.id).length >
            0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Your Requests</h4>
              {pendingRequests
                .filter((r) => r.userId === currentUser.id)
                .map((request) => (
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
                                    onClick={() =>
                                      handleRespondToRequest(request.id, true)
                                    }
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
                                    onClick={() =>
                                      handleRespondToRequest(request.id, false)
                                    }
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
                                  onClick={() =>
                                    handleCancelRequest(request.id)
                                  }
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
          )}
      </CardContent>
    </Card>
  );
}
