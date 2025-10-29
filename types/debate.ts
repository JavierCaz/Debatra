import type { Prisma } from "@/app/generated/prisma";

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
  topic: string;
  description: string;
  format: "ONE_VS_ONE" | "ONE_VS_MANY" | "MULTI_SIDED";
  maxParticipants: number;
  turnsPerSide: number;
  turnTimeLimit: number;
  minReferences: number;
}

export interface DebateFormat {
  value: DebateFormData["format"];
  label: string;
  description: string;
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
            references: true;
            votes: true;
            rebuttalTo: {
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
                rebuttals: true;
              };
            };
          };
        };
      };
    };
    winCondition: true;
  };
}>;
