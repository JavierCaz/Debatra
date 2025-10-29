"use server";

import { prisma } from "@/lib/prisma/client";
import type { DebateStatus } from "@/types/debate";

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

export interface DebateFilters {
  status?: DebateStatus | "ALL";
  search?: string;
}

export async function getDebates(filters: DebateFilters = {}) {
  try {
    const { status, search } = filters;

    const where: any = {};

    // Filter by status
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Search by topic or title
    if (search && search.trim()) {
      where.OR = [
        {
          topic: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const debates = await prisma.debate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            arguments: true,
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, debates };
  } catch (error) {
    console.error("Error fetching debates:", error);
    return { success: false, error: "Failed to fetch debates" };
  }
}
