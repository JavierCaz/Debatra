"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { detectReferenceType } from "@/lib/utils/reference-types";
import type { InitialArgument } from "@/types/debate";
import { type DebateStatus, DebateTopic } from "@/types/debate";
import { DefinitionStatus, type ReferenceType } from "../generated/prisma";

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
                definitionReferences: {
                  include: {
                    definition: {
                      select: {
                        id: true,
                        term: true,
                        definition: true,
                      },
                    },
                  },
                },
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
        definitions: {
          include: {
            proposer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            references: true,
            votes: true,
            endorsements: {
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
            argumentReferences: {
              select: {
                argumentId: true,
              },
            },
            supersededBy: {
              select: {
                id: true,
                term: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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

export async function submitDebateArguments(
  debateId: string,
  argumentsData: InitialArgument[],
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to submit arguments");
    }

    if (!argumentsData || argumentsData.length === 0) {
      throw new Error("At least one argument is required");
    }

    // Get basic debate info first
    const basicDebate = await prisma.debate.findUnique({
      where: { id: debateId },
      select: {
        id: true,
        status: true,
        currentTurnSide: true,
        currentTurnNumber: true,
        turnsPerSide: true,
        minReferences: true,
        title: true,
      },
    });

    if (!basicDebate) {
      throw new Error("Debate not found");
    }

    if (basicDebate.status !== "IN_PROGRESS") {
      throw new Error("Debate is not in progress");
    }

    // Get current user's participant record
    const currentParticipant = await prisma.debateParticipant.findFirst({
      where: {
        debateId: debateId,
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        arguments: {
          where: {
            turnNumber: basicDebate.currentTurnNumber,
          },
          select: { id: true },
        },
      },
    });

    if (!currentParticipant) {
      throw new Error("You are not a participant in this debate");
    }

    if (currentParticipant.role !== basicDebate.currentTurnSide) {
      throw new Error("It's not your turn to submit arguments");
    }

    if (currentParticipant.arguments.length > 0) {
      throw new Error("You have already submitted arguments for this turn");
    }

    // Validate arguments
    for (const arg of argumentsData) {
      const plainText = arg.content.replace(/<[^>]*>/g, "").trim();
      if (plainText.length < 10) {
        throw new Error(
          "Each argument must have at least 10 characters of content",
        );
      }
      if (arg.references.length < basicDebate.minReferences) {
        throw new Error(
          `Each argument requires at least ${basicDebate.minReferences} reference(s)`,
        );
      }
    }

    // Use transaction for the actual submission
    const result = await prisma.$transaction(async (tx) => {
      // Create arguments
      for (const argData of argumentsData) {
        await tx.argument.create({
          data: {
            content: argData.content,
            turnNumber: basicDebate.currentTurnNumber,
            debateId: debateId,
            participantId: currentParticipant.id,
            authorId: session.user.id,
            references: {
              create: argData.references.map((ref) => ({
                type: "WEBSITE",
                title: ref.title,
                url: ref.url,
                accessedAt: new Date(),
              })),
            },
          },
        });
      }

      // Check if this was the last participant on this side for THIS TURN
      const participantsOnSameSide = await tx.debateParticipant.findMany({
        where: {
          debateId: debateId,
          role: basicDebate.currentTurnSide,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const participantsSubmittedThisTurn = await tx.argument.findMany({
        where: {
          debateId: debateId,
          turnNumber: basicDebate.currentTurnNumber,
          participantId: {
            in: participantsOnSameSide.map((p) => p.id),
          },
        },
        select: {
          participantId: true,
        },
        distinct: ["participantId"],
      });

      let updatedDebateData = null;

      // If all participants on this side have submitted for this turn
      if (
        participantsSubmittedThisTurn.length === participantsOnSameSide.length
      ) {
        // Determine what to do next based on the current side

        if (basicDebate.currentTurnSide === "PROPOSER") {
          // Proposer just finished, switch to Opposer for the same turn number
          updatedDebateData = await tx.debate.update({
            where: { id: debateId },
            data: {
              currentTurnSide: "OPPOSER",
              updatedAt: new Date(),
            },
          });

          // Create notifications for OPPOSER participants
          const opposerParticipants = await tx.debateParticipant.findMany({
            where: {
              debateId: debateId,
              role: "OPPOSER",
              status: "ACTIVE",
            },
            include: {
              user: {
                select: { id: true },
              },
            },
          });

          for (const participant of opposerParticipants) {
            await tx.notification.create({
              data: {
                type: "NEW_ARGUMENT",
                title: "Your turn to respond",
                message: `The proposer has made their arguments for turn ${basicDebate.currentTurnNumber}. It's your turn to respond in the debate "${basicDebate.title}"`,
                link: `/debates/${debateId}`,
                userId: participant.user.id,
                actorId: session.user.id,
                debateId: debateId,
                metadata: {
                  turnNumber: basicDebate.currentTurnNumber,
                  turnSide: "OPPOSER",
                },
              },
            });
          }
        } else {
          // Opposer just finished, this completes the current turn
          // Check if we've reached the maximum turns
          const isLastTurn =
            basicDebate.currentTurnNumber >= basicDebate.turnsPerSide;

          if (isLastTurn) {
            // Debate is completed
            updatedDebateData = await tx.debate.update({
              where: { id: debateId },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                updatedAt: new Date(),
              },
            });
          } else {
            // Move to next turn and switch back to Proposer
            const nextTurnNumber = basicDebate.currentTurnNumber + 1;

            updatedDebateData = await tx.debate.update({
              where: { id: debateId },
              data: {
                currentTurnSide: "PROPOSER",
                currentTurnNumber: nextTurnNumber,
                updatedAt: new Date(),
              },
            });

            // Create notifications for PROPOSER participants
            const proposerParticipants = await tx.debateParticipant.findMany({
              where: {
                debateId: debateId,
                role: "PROPOSER",
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: { id: true },
                },
              },
            });

            for (const participant of proposerParticipants) {
              await tx.notification.create({
                data: {
                  type: "NEW_ARGUMENT",
                  title: "New turn started",
                  message: `Turn ${nextTurnNumber} has started. It's your turn to present arguments in the debate "${basicDebate.title}"`,
                  link: `/debates/${debateId}`,
                  userId: participant.user.id,
                  actorId: session.user.id,
                  debateId: debateId,
                  metadata: {
                    turnNumber: nextTurnNumber,
                    turnSide: "PROPOSER",
                  },
                },
              });
            }
          }
        }
      }

      // Return the updated debate data if it was modified, otherwise return the original
      return {
        success: true,
        error: null,
        debate: updatedDebateData || basicDebate,
      };
    });

    revalidatePath(`/debates/${debateId}`);
    return result;
  } catch (error) {
    console.error("Error submitting debate arguments:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit arguments",
    };
  }
}

export async function getDebateTurnInfo(debateId: string) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            arguments: {
              where: {
                turnNumber: {
                  equals: await prisma.debate
                    .findUnique({
                      where: { id: debateId },
                      select: { currentTurnNumber: true },
                    })
                    .then((debate) => debate?.currentTurnNumber || 1),
                },
              },
              select: {
                id: true,
                participantId: true,
              },
            },
          },
        },
      },
    });

    if (!debate) {
      return null;
    }

    const currentTurnSideParticipants = debate.participants.filter(
      (p) => p.role === debate.currentTurnSide,
    );

    const submittedParticipants = currentTurnSideParticipants.filter(
      (p) => p.arguments.length > 0,
    );

    const remainingParticipants = currentTurnSideParticipants.filter(
      (p) => p.arguments.length === 0,
    );

    return {
      currentTurn: debate.currentTurnNumber,
      currentTurnSide: debate.currentTurnSide,
      totalParticipantsOnCurrentSide: currentTurnSideParticipants.length,
      submittedParticipants: submittedParticipants.length,
      remainingParticipants: remainingParticipants.length,
      isLastTurn: debate.currentTurnNumber >= debate.turnsPerSide * 2,
    };
  } catch (error) {
    console.error("Error getting debate turn info:", error);
    return null;
  }
}

export async function voteOnDefinition(definitionId: string, support: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to vote on definitions");
    }

    const definition = await prisma.definition.findUnique({
      where: { id: definitionId },
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
          },
        },
        debate: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!definition) {
      throw new Error("Definition not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Upsert the vote
      const vote = await tx.definitionVote.upsert({
        where: {
          definitionId_userId: {
            definitionId,
            userId: session.user.id,
          },
        },
        update: {
          support,
          createdAt: new Date(),
        },
        create: {
          definitionId,
          userId: session.user.id,
          support,
        },
      });

      if (definition.proposer.id !== session.user.id) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_VOTE",
            title: support ? "Definition Upvoted" : "Definition Downvoted",
            message: `Someone ${support ? "upvoted" : "downvoted"} your definition for "${definition.term}" in the debate "${definition.debate.title}"`,
            link: `/debates/${definition.debate.id}?tab=definitions`,
            userId: definition.proposer.id,
            actorId: session.user.id,
            debateId: definition.debate.id,
            metadata: {
              definitionId: definition.id,
              term: definition.term,
              support: support,
              type: "definition_vote",
            },
          },
        });
      }

      return vote;
    });

    revalidatePath(`/debates/${definition.debate.id}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error voting on definition:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to vote on definition",
    };
  }
}

export async function endorseDefinition(definitionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to endorse definitions");
    }

    // Check if user is a participant in the debate
    const definition = await prisma.definition.findUnique({
      where: { id: definitionId },
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
          },
        },
        debate: {
          include: {
            participants: {
              where: {
                userId: session.user.id,
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    if (!definition) {
      throw new Error("Definition not found");
    }

    if (definition.debate.participants.length === 0) {
      throw new Error("Only debate participants can endorse definitions");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Upsert the endorsement
      const endorsement = await tx.definitionEndorsement.upsert({
        where: {
          definitionId_userId: {
            definitionId,
            userId: session.user.id,
          },
        },
        update: {
          createdAt: new Date(),
        },
        create: {
          definitionId,
          userId: session.user.id,
        },
      });

      if (definition.proposer.id !== session.user.id) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_ENDORSED",
            title: "Definition Endorsed",
            message: `A participant endorsed your definition for "${definition.term}" in the debate "${definition.debate.title}"`,
            link: `/debates/${definition.debate.id}?tab=definitions`,
            userId: definition.proposer.id,
            actorId: session.user.id,
            debateId: definition.debate.id,
            metadata: {
              definitionId: definition.id,
              term: definition.term,
              type: "definition_endorsed",
            },
          },
        });
      }

      return endorsement;
    });

    revalidatePath(`/debates/${definition.debate.id}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error endorsing definition:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to endorse definition",
    };
  }
}

export async function submitDefinition(
  debateId: string,
  definitionData: {
    term: string;
    definition: string;
    context?: string;
    references: Array<{
      type: string;
      title: string;
      url?: string;
      author?: string;
      publication?: string;
      notes?: string;
    }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to submit definitions");
    }

    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      select: {
        id: true,
        status: true,
        title: true,
        participants: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!debate) {
      throw new Error("Debate not found");
    }

    if (debate.status !== "IN_PROGRESS") {
      throw new Error(
        "Definitions can only be submitted during ongoing debates",
      );
    }

    // Validate definition data
    if (!definitionData.term.trim() || !definitionData.definition.trim()) {
      throw new Error("Term and definition are required");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create definition
      const definition = await tx.definition.create({
        data: {
          term: definitionData.term.trim(),
          definition: definitionData.definition.trim(),
          context: definitionData.context?.trim(),
          status: "PROPOSED",
          debateId,
          proposerId: session.user.id,
          references: {
            create: definitionData.references.map((ref) => ({
              type: detectReferenceType(ref.url ?? "") as ReferenceType,
              title: ref.title,
              url: ref.url,
              author: ref.author,
              publication: ref.publication,
              notes: ref.notes,
              accessedAt: new Date(),
            })),
          },
        },
        include: {
          proposer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          references: true,
        },
      });

      // Send notifications to all other participants
      const otherParticipants = debate.participants.filter(
        (p) => p.userId !== session.user.id,
      );

      for (const participant of otherParticipants) {
        await tx.notification.create({
          data: {
            type: "NEW_DEFINITION",
            title: "New Definition Proposed",
            message: `${definition.proposer.name} proposed a new definition for "${definition.term}" in the debate "${debate.title}"`,
            link: `/debates/${debateId}?tab=definitions`,
            userId: participant.user.id,
            actorId: session.user.id,
            debateId: debateId,
            metadata: {
              definitionId: definition.id,
              term: definition.term,
              type: "definition_created",
            },
          },
        });
      }

      return definition;
    });

    revalidatePath(`/debates/${debateId}`);
    return { success: true, error: null, definition: result };
  } catch (error) {
    console.error("Error submitting definition:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit definition",
    };
  }
}

export async function acceptDefinition(definitionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to accept definitions");
    }

    const definition = await prisma.definition.findUnique({
      where: { id: definitionId },
      include: {
        debate: {
          include: {
            participants: {
              where: {
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        proposer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!definition) {
      throw new Error("Definition not found");
    }

    if (
      definition.debate.participants.find(
        (p) => p.userId === session.user.id,
      ) === undefined
    ) {
      throw new Error("Only debate participants can accept definitions");
    }

    const result = await prisma.$transaction(async (tx) => {
      if (definition.supersededById) {
        await tx.definition.update({
          where: { id: definition.supersededById },
          data: {
            status: "DEPRECATED",
          },
        });
      }

      // Update definition status to ACCEPTED
      const updatedDefinition = await tx.definition.update({
        where: { id: definitionId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      // Send notification to the definition proposer
      if (definition.proposer.id !== session.user.id) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_ACCEPTED",
            title: "Definition Accepted",
            message: `Your definition for "${definition.term}" has been accepted in the debate "${definition.debate.title}"`,
            link: `/debates/${definition.debateId}?tab=definitions`,
            userId: definition.proposer.id,
            actorId: session.user.id,
            debateId: definition.debateId,
            metadata: {
              definitionId: definition.id,
              term: definition.term,
              type: "definition_accepted",
            },
          },
        });
      }

      // Send notifications to all other participants
      const otherParticipants = definition.debate.participants.filter(
        (p) =>
          p.userId !== session.user.id && p.userId !== definition.proposer.id,
      );

      for (const participant of otherParticipants) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_ACCEPTED",
            title: "Definition Accepted",
            message: `The definition for "${definition.term}" has been accepted in the debate "${definition.debate.title}"`,
            link: `/debates/${definition.debateId}?tab=definitions`,
            userId: participant.user.id,
            actorId: session.user.id,
            debateId: definition.debateId,
            metadata: {
              definitionId: definition.id,
              term: definition.term,
              type: "definition_accepted",
            },
          },
        });
      }

      return updatedDefinition;
    });

    revalidatePath(`/debates/${definition.debateId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error accepting definition:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to accept definition",
    };
  }
}

export async function supersedeDefinition(
  originalDefinitionId: string,
  newDefinitionData: {
    term: string;
    definition: string;
    context?: string;
    references: Array<{
      type: string;
      title: string;
      url?: string;
      author?: string;
      publication?: string;
      notes?: string;
    }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to supersede definitions");
    }

    const originalDefinition = await prisma.definition.findUnique({
      where: { id: originalDefinitionId },
      include: {
        debate: {
          include: {
            participants: {
              where: {
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        proposer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!originalDefinition) {
      throw new Error("Original definition not found");
    }

    if (
      originalDefinition.debate.participants.find(
        (p) => p.userId === session.user.id,
      ) === undefined
    ) {
      throw new Error("Only debate participants can supersede definitions");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the new definition
      const newDefinition = await tx.definition.create({
        data: {
          term: newDefinitionData.term.trim(),
          definition: newDefinitionData.definition.trim(),
          context: newDefinitionData.context?.trim(),
          status: "PROPOSED",
          debateId: originalDefinition.debateId,
          proposerId: session.user.id,
          references: {
            create: newDefinitionData.references.map((ref) => ({
              type: detectReferenceType(ref.url ?? "") as ReferenceType,
              title: ref.title,
              url: ref.url,
              author: ref.author,
              publication: ref.publication,
              notes: ref.notes,
              accessedAt: new Date(),
            })),
          },
        },
      });

      let newOriginalStatus: DefinitionStatus = DefinitionStatus.CONTESTED;
      if (originalDefinition.status === DefinitionStatus.ACCEPTED) {
        newOriginalStatus = DefinitionStatus.DEPRECATED;
      }

      await tx.definition.update({
        where: { id: originalDefinitionId },
        data: {
          status: newOriginalStatus,
          supersededById: newDefinition.id,
        },
      });

      // Send notification to the original definition proposer
      if (originalDefinition.proposer.id !== session.user.id) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_IMPROVED",
            title: "Definition Improved",
            message: `Your definition for "${originalDefinition.term}" has been improved by another participant in the debate "${originalDefinition.debate.title}"`,
            link: `/debates/${originalDefinition.debateId}?tab=definitions`,
            userId: originalDefinition.proposer.id,
            actorId: session.user.id,
            debateId: originalDefinition.debateId,
            metadata: {
              originalDefinitionId: originalDefinition.id,
              newDefinitionId: newDefinition.id,
              term: originalDefinition.term,
              type: "definition_superseded",
            },
          },
        });
      }

      // Send notifications to all other participants
      const otherParticipants = originalDefinition.debate.participants.filter(
        (p) =>
          p.userId !== session.user.id &&
          p.userId !== originalDefinition.proposer.id,
      );

      for (const participant of otherParticipants) {
        await tx.notification.create({
          data: {
            type: "DEFINITION_IMPROVED",
            title: "Definition Improved",
            message: `The definition for "${originalDefinition.term}" has been improved in the debate "${originalDefinition.debate.title}"`,
            link: `/debates/${originalDefinition.debateId}?tab=definitions`,
            userId: participant.user.id,
            actorId: session.user.id,
            debateId: originalDefinition.debateId,
            metadata: {
              originalDefinitionId: originalDefinition.id,
              newDefinitionId: newDefinition.id,
              term: originalDefinition.term,
              type: "definition_improved",
            },
          },
        });
      }

      return newDefinition;
    });

    revalidatePath(`/debates/${originalDefinition.debateId}`);
    return { success: true, error: null, definition: result };
  } catch (error) {
    console.error("Error superseding definition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to supersede definition",
    };
  }
}
