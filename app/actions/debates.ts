"use server";

import { prisma } from "@/lib/prisma/client";

export async function getDebateById(id: string) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            arguments: {
              include: {
                references: true,
                votes: true,
                rebuttalTo: {
                  include: {
                    participant: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                          },
                        },
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    rebuttals: true,
                  },
                },
              },
              orderBy: [{ turnNumber: "asc" }, { createdAt: "asc" }],
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        winCondition: true,
      },
    });

    if (!debate) {
      return null;
    }

    return debate;
  } catch (error) {
    console.error("Error fetching debate:", error);
    throw new Error("Failed to fetch debate");
  }
}
