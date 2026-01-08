import type {
  Debate,
  DebateRequest,
  ParticipantRole,
  ParticipantStatus,
} from "@prisma";

export interface DebateRequestsPanelProps {
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
      status: ParticipantStatus;
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
      winningRole: ParticipantRole | null;
      decidedAt: Date | null;
    } | null;
    currentTurnSide: ParticipantRole;
    currentTurnNumber: number;
  };
}

export type ExtendedRequest = DebateRequest & {
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

export interface RoleOption {
  value: ParticipantRole;
  label: string;
  taken: boolean;
}
