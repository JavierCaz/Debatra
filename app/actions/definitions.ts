"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { detectReferenceType } from "@/lib/utils/reference-types";
import { createNotificationMetadata } from "@/types/notifications";
import { DefinitionStatus, type ReferenceType } from "../generated/prisma";
import { createBulkNotifications, createNotification } from "./notifications";

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
        await createNotification({
          userId: definition.proposer.id,
          type: "DEFINITION_VOTE",
          title: support ? "Definition Upvoted" : "Definition Downvoted",
          message: `Someone ${support ? "upvoted" : "downvoted"} your definition for "${definition.term}" in the debate "${definition.debate.title}"`,
          link: `/debates/${definition.debate.id}?tab=definitions`,
          actorId: session.user.id,
          debateId: definition.debate.id,
          metadata: createNotificationMetadata("DEFINITION_VOTE", {
            definitionId: definition.id,
            term: definition.term,
            support: support,
          }),
          sendEmail: true, // Enable email notifications
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
        await createNotification({
          userId: definition.proposer.id,
          type: "DEFINITION_ENDORSED",
          title: "Definition Endorsed",
          message: `A participant endorsed your definition for "${definition.term}" in the debate "${definition.debate.title}"`,
          link: `/debates/${definition.debate.id}?tab=definitions`,
          actorId: session.user.id,
          debateId: definition.debate.id,
          metadata: createNotificationMetadata("DEFINITION_ENDORSED", {
            definitionId: definition.id,
            term: definition.term,
            type: "DEFINITION_ENDORSED",
            timestamp: new Date().toISOString(),
          }),
          sendEmail: true, // Enable email notifications
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

      if (otherParticipants.length > 0) {
        await createBulkNotifications({
          userIds: otherParticipants.map((p) => p.user.id),
          type: "NEW_DEFINITION",
          title: "New Definition Proposed",
          message: `${definition.proposer.name} proposed a new definition for "${definition.term}" in the debate "${debate.title}"`,
          link: `/debates/${debateId}?tab=definitions`,
          actorId: session.user.id,
          debateId: debateId,
          metadata: createNotificationMetadata("NEW_DEFINITION", {
            definitionId: definition.id,
            term: definition.term,
            type: "definition_created",
          }),
          sendEmail: true, // Enable email notifications
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
        await createNotification({
          userId: definition.proposer.id,
          type: "DEFINITION_ACCEPTED",
          title: "Definition Accepted",
          message: `Your definition for "${definition.term}" has been accepted in the debate "${definition.debate.title}"`,
          link: `/debates/${definition.debateId}?tab=definitions`,
          actorId: session.user.id,
          debateId: definition.debateId,
          metadata: createNotificationMetadata("DEFINITION_ACCEPTED", {
            definitionId: definition.id,
            term: definition.term,
            timestamp: new Date().toISOString(),
            type: "DEFINITION_ACCEPTED",
          }),
          sendEmail: true, // Enable email notifications
        });
      }

      // Send notifications to all other participants
      const otherParticipants = definition.debate.participants.filter(
        (p) =>
          p.userId !== session.user.id && p.userId !== definition.proposer.id,
      );

      if (otherParticipants.length > 0) {
        await createBulkNotifications({
          userIds: otherParticipants.map((p) => p.user.id),
          type: "DEFINITION_ACCEPTED",
          title: "Definition Accepted",
          message: `The definition for "${definition.term}" has been accepted in the debate "${definition.debate.title}"`,
          link: `/debates/${definition.debateId}?tab=definitions`,
          actorId: session.user.id,
          debateId: definition.debateId,
          metadata: createNotificationMetadata("DEFINITION_ACCEPTED", {
            definitionId: definition.id,
            term: definition.term,
            type: "definition_accepted",
          }),
          sendEmail: true, // Enable email notifications
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
        await createNotification({
          userId: originalDefinition.proposer.id,
          type: "DEFINITION_IMPROVED",
          title: "Definition Improved",
          message: `Your definition for "${originalDefinition.term}" has been improved by another participant in the debate "${originalDefinition.debate.title}"`,
          link: `/debates/${originalDefinition.debateId}?tab=definitions`,
          actorId: session.user.id,
          debateId: originalDefinition.debateId,
          metadata: createNotificationMetadata("DEFINITION_IMPROVED", {
            originalDefinitionId: originalDefinition.id,
            newDefinitionId: newDefinition.id,
            term: originalDefinition.term,
          }),
          sendEmail: true, // Enable email notifications
        });
      }

      // Send notifications to all other participants
      const otherParticipants = originalDefinition.debate.participants.filter(
        (p) =>
          p.userId !== session.user.id &&
          p.userId !== originalDefinition.proposer.id,
      );

      if (otherParticipants.length > 0) {
        await createBulkNotifications({
          userIds: otherParticipants.map((p) => p.user.id),
          type: "DEFINITION_IMPROVED",
          title: "Definition Improved",
          message: `The definition for "${originalDefinition.term}" has been improved in the debate "${originalDefinition.debate.title}"`,
          link: `/debates/${originalDefinition.debateId}?tab=definitions`,
          actorId: session.user.id,
          debateId: originalDefinition.debateId,
          metadata: createNotificationMetadata("DEFINITION_IMPROVED", {
            originalDefinitionId: originalDefinition.id,
            newDefinitionId: newDefinition.id,
            term: originalDefinition.term,
          }),
          sendEmail: true, // Enable email notifications
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
