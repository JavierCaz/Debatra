import type { Prisma } from "@/app/generated/prisma";

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
