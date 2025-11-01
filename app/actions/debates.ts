"use server";

import { prisma } from "@/lib/prisma/client";
import { type DebateStatus, DebateTopic } from "@/types/debate";

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
        topics: true,
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
                responseTo: {
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
                    responses: true,
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
  topic?: DebateTopic; // Optional topic filter
}

export async function getDebates(filters: DebateFilters = {}) {
  try {
    const { status, search, topic } = filters;

    const where: any = {};

    // Filter by status
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filter by specific topic
    if (topic) {
      where.topics = {
        some: {
          topic: topic,
        },
      };
    }

    // Search by title, description, or topics
    if (search && search.trim()) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          // Search through topic names (this requires a more complex query)
          topics: {
            some: {
              topic: {
                in: getTopicsFromSearch(search), // Helper function to map search to topics
              },
            },
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
        topics: true, // Include debate topics
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

// Helper function to map search terms to topic enums
function getTopicsFromSearch(search: string): DebateTopic[] {
  const searchLower = search.toLowerCase();
  const matchingTopics: DebateTopic[] = [];

  // Map common search terms to topics
  const topicMappings: Record<string, DebateTopic[]> = {
    politics: [DebateTopic.POLITICS],
    government: [DebateTopic.POLITICS],
    election: [DebateTopic.POLITICS],
    economy: [DebateTopic.ECONOMICS],
    money: [DebateTopic.ECONOMICS],
    finance: [DebateTopic.ECONOMICS],
    tech: [DebateTopic.TECHNOLOGY],
    ai: [DebateTopic.TECHNOLOGY],
    computer: [DebateTopic.TECHNOLOGY],
    science: [DebateTopic.SCIENCE],
    research: [DebateTopic.SCIENCE],
    health: [DebateTopic.HEALTH_MEDICINE],
    medical: [DebateTopic.HEALTH_MEDICINE],
    education: [DebateTopic.EDUCATION],
    school: [DebateTopic.EDUCATION],
    society: [DebateTopic.SOCIETY_CULTURE],
    culture: [DebateTopic.SOCIETY_CULTURE],
    philosophy: [DebateTopic.PHILOSOPHY],
    ethics: [DebateTopic.PHILOSOPHY],
    law: [DebateTopic.LAW_JUSTICE],
    legal: [DebateTopic.LAW_JUSTICE],
    international: [DebateTopic.INTERNATIONAL_RELATIONS],
    global: [DebateTopic.INTERNATIONAL_RELATIONS],
    arts: [DebateTopic.ARTS],
    entertainment: [DebateTopic.ENTERTAINMENT],
    sports: [DebateTopic.SPORTS],
    religion: [DebateTopic.RELIGION_SPIRITUALITY],
    spiritual: [DebateTopic.RELIGION_SPIRITUALITY],
    psychology: [DebateTopic.PSYCHOLOGY_BEHAVIOR],
    behavior: [DebateTopic.PSYCHOLOGY_BEHAVIOR],
    environment: [DebateTopic.ENVIRONMENT_CLIMATE],
    climate: [DebateTopic.ENVIRONMENT_CLIMATE],
    history: [DebateTopic.HISTORY],
  };

  // Check for matching topics
  Object.entries(topicMappings).forEach(([keyword, topics]) => {
    if (searchLower.includes(keyword)) {
      matchingTopics.push(...topics);
    }
  });

  // Remove duplicates
  return [...new Set(matchingTopics)];
}

// Additional helper functions for topic-based queries
export async function getDebatesByTopic(topic: DebateTopic) {
  try {
    const debates = await prisma.debate.findMany({
      where: {
        topics: {
          some: {
            topic: topic,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topics: true,
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
    console.error("Error fetching debates by topic:", error);
    return { success: false, error: "Failed to fetch debates" };
  }
}

export async function getPopularTopics(limit: number = 10) {
  try {
    const popularTopics = await prisma.debateTopic.groupBy({
      by: ["topic"],
      _count: {
        topic: true,
      },
      orderBy: {
        _count: {
          topic: "desc",
        },
      },
      take: limit,
    });

    return { success: true, topics: popularTopics };
  } catch (error) {
    console.error("Error fetching popular topics:", error);
    return { success: false, error: "Failed to fetch popular topics" };
  }
}
