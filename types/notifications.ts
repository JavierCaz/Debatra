import type { NotificationType } from "@/app/generated/prisma";

export type BaseNotificationMetadata = Record<string, any> & {
  type: string;
  timestamp: string;
};

export interface ArgumentVoteMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "ARGUMENT_VOTE">;
  argumentId: string;
  voteType: "supported" | "opposed";
  turnNumber?: number;
}

export interface DefinitionVoteMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEFINITION_VOTE">;
  definitionId: string;
  term: string;
  support: boolean;
}

export interface NewArgumentMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "NEW_ARGUMENT">;
  turnNumber: number;
  turnSide: "PROPOSER" | "OPPOSER";
  debateTitle: string;
}

export interface DefinitionCreatedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "NEW_DEFINITION">;
  definitionId: string;
  term: string;
  proposerName: string;
}

export interface DefinitionAcceptedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEFINITION_ACCEPTED">;
  definitionId: string;
  term: string;
}

export interface DefinitionImprovedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEFINITION_IMPROVED">;
  originalDefinitionId: string;
  newDefinitionId: string;
  term: string;
}

export interface DefinitionEndorsedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEFINITION_ENDORSED">;
  definitionId: string;
  term: string;
}

export interface DebateInvitationMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEBATE_INVITATION">;
  requestId: string;
  role: "PROPOSER" | "OPPOSER";
  debateTitle: string;
}

export interface DebateAcceptedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEBATE_ACCEPTED">;
  requestId: string;
  debateTitle: string;
  role?: "PROPOSER" | "OPPOSER";
}

export interface DebateDeclinedMetadata extends BaseNotificationMetadata {
  type: Extract<NotificationType, "DEBATE_DECLINED">;
  requestId: string;
  debateTitle: string;
  role?: "PROPOSER" | "OPPOSER";
}

export type NotificationMetadata =
  | ArgumentVoteMetadata
  | DefinitionVoteMetadata
  | NewArgumentMetadata
  | DefinitionCreatedMetadata
  | DefinitionAcceptedMetadata
  | DefinitionEndorsedMetadata
  | DebateInvitationMetadata
  | DebateAcceptedMetadata
  | DebateDeclinedMetadata
  | DefinitionImprovedMetadata;

export type MetadataForNotificationType<T extends NotificationType> = Extract<
  NotificationMetadata,
  { type: T }
>;

export function createNotificationMetadata<T extends NotificationMetadata>(
  type: T["type"],
  data: Omit<T, "type" | "timestamp">,
): T {
  return {
    type,
    timestamp: new Date().toISOString(),
    ...data,
  } as T;
}
