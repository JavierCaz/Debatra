import type { Prisma } from "@/app/generated/prisma";

export enum DebateStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DebateFormat {
  ONE_VS_ONE = "ONE_VS_ONE",
  ONE_VS_MANY = "ONE_VS_MANY",
  MULTI_SIDED = "MULTI_SIDED",
}

export enum DebateTopic {
  POLITICS = "POLITICS",
  ECONOMICS = "ECONOMICS",
  TECHNOLOGY = "TECHNOLOGY",
  SCIENCE = "SCIENCE",
  HEALTH_MEDICINE = "HEALTH_MEDICINE",
  EDUCATION = "EDUCATION",
  SOCIETY_CULTURE = "SOCIETY_CULTURE",
  PHILOSOPHY = "PHILOSOPHY",
  LAW_JUSTICE = "LAW_JUSTICE",
  INTERNATIONAL_RELATIONS = "INTERNATIONAL_RELATIONS",
  ARTS = "ARTS",
  ENTERTAINMENT = "ENTERTAINMENT",
  SPORTS = "SPORTS",
  RELIGION_SPIRITUALITY = "RELIGION_SPIRITUALITY",
  PSYCHOLOGY_BEHAVIOR = "PSYCHOLOGY_BEHAVIOR",
  ENVIRONMENT_CLIMATE = "ENVIRONMENT_CLIMATE",
  HISTORY = "HISTORY",
}

export enum ParticipantRole {
  PROPOSER = "PROPOSER",
  OPPOSER = "OPPOSER",
  NEUTRAL = "NEUTRAL",
}

export function getTopicDisplayName(topic: DebateTopic): string {
  const displayNames: Record<DebateTopic, string> = {
    [DebateTopic.POLITICS]: "Politics",
    [DebateTopic.ECONOMICS]: "Economics",
    [DebateTopic.TECHNOLOGY]: "Technology",
    [DebateTopic.SCIENCE]: "Science",
    [DebateTopic.HEALTH_MEDICINE]: "Health & Medicine",
    [DebateTopic.EDUCATION]: "Education",
    [DebateTopic.SOCIETY_CULTURE]: "Society & Culture",
    [DebateTopic.PHILOSOPHY]: "Philosophy",
    [DebateTopic.LAW_JUSTICE]: "Law & Justice",
    [DebateTopic.INTERNATIONAL_RELATIONS]: "International Relations",
    [DebateTopic.ARTS]: "Arts",
    [DebateTopic.ENTERTAINMENT]: "Entertainment",
    [DebateTopic.SPORTS]: "Sports",
    [DebateTopic.RELIGION_SPIRITUALITY]: "Religion & Spirituality",
    [DebateTopic.PSYCHOLOGY_BEHAVIOR]: "Psychology & Behavior",
    [DebateTopic.ENVIRONMENT_CLIMATE]: "Environment & Climate",
    [DebateTopic.HISTORY]: "History",
  };

  return displayNames[topic];
}

export const ALL_DEBATE_TOPICS = Object.values(DebateTopic);

export interface Reference {
  id: number;
  title: string;
  url: string;
}

export interface InitialArgument {
  id: number;
  content: string;
  references: Reference[];
}

export interface DebateFormData {
  title: string;
  topics: DebateTopic[];
  description: string;
  format: DebateFormat;
  maxParticipants: number;
  turnsPerSide: number;
  turnTimeLimit: number;
  minReferences: number;
}

export interface DebateWithTopics {
  id: string;
  title: string;
  description: string;
  topics: DebateTopic[];
}

export type DebateWithDetails = Prisma.DebateGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
    topics: true;
    participants: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            image: true;
          };
        };
        arguments: {
          include: {
            participant: {
              include: {
                user: {
                  select: {
                    id: true;
                    name: true;
                    email: true;
                    image: true;
                  };
                };
              };
            };
            references: true;
            votes: true;
            responseTo: {
              include: {
                participant: {
                  include: {
                    user: {
                      select: {
                        id: true;
                        name: true;
                        email: true;
                        image: true;
                      };
                    };
                  };
                };
              };
            };
            _count: {
              select: {
                responses: true;
              };
            };
          };
        };
      };
    };
    winCondition: true;
  };
}>;
