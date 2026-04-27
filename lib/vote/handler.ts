import { createNotification } from "@/app/actions/notifications";
import { prisma } from "@/lib/prisma/client";
import { createNotificationMetadata } from "@/types/notifications";

export async function handleArgumentVote(
  argumentId: string,
  support: boolean,
  userId: string,
) {
  const argument = await prisma.argument.findUnique({
    where: { id: argumentId },
    include: {
      participant: { include: { user: true } },
      debate: true,
    },
  });

  if (!argument) throw new Error("Argument not found");

  const vote = await (async () => {
    const existingVote = await prisma.argumentVote.findUnique({
      where: { argumentId_userId: { argumentId, userId } },
    });

    if (!existingVote) {
      return prisma.argumentVote.create({
        data: { argumentId, userId, support },
      });
    }

    if (existingVote.support !== support) {
      return prisma.argumentVote.update({
        where: { argumentId_userId: { argumentId, userId } },
        data: { support },
      });
    }

    return prisma.argumentVote.delete({
      where: { argumentId_userId: { argumentId, userId } },
    });
  })();

  const authorId = argument.participant.userId;
  if (authorId !== userId && vote) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userName = user?.name ?? "Someone";
      const voteType = support ? "supported" : "opposed";

      await createNotification({
        userId: authorId,
        type: "ARGUMENT_VOTE",
        title: `Argument ${voteType}`,
        message: `${userName} ${voteType} your argument`,
        link: `/debates/${argument.debateId}?tab=arguments#argument-${argument.id}`,
        actorId: userId,
        debateId: argument.debateId,
        metadata: createNotificationMetadata("ARGUMENT_VOTE", {
          argumentId: argument.id,
          voteType,
        }),
        sendEmail: true,
      });
    } catch (error) {
      console.error("Failed to create argument vote notification:", error);
    }
  }

  return { success: true, vote };
}

export async function handleDefinitionVote(
  definitionId: string,
  support: boolean,
  userId: string,
) {
  const definition = await prisma.definition.findUnique({
    where: { id: definitionId },
    include: { proposer: true, debate: true },
  });

  if (!definition) throw new Error("Definition not found");

  const vote = await (async () => {
    const existingVote = await prisma.definitionVote.findUnique({
      where: { definitionId_userId: { definitionId, userId } },
    });

    if (!existingVote) {
      return prisma.definitionVote.create({
        data: { definitionId, userId, support },
      });
    }

    if (existingVote.support !== support) {
      return prisma.definitionVote.update({
        where: { definitionId_userId: { definitionId, userId } },
        data: { support },
      });
    }

    return prisma.definitionVote.delete({
      where: { definitionId_userId: { definitionId, userId } },
    });
  })();

  const authorId = definition.proposerId;
  if (authorId !== userId && vote) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userName = user?.name ?? "Someone";
      const voteType = support ? "supported" : "opposed";

      await createNotification({
        userId: authorId,
        type: "DEFINITION_VOTE",
        title: `Definition ${voteType}`,
        message: `${userName} ${voteType} your definition of "${definition.term}"`,
        link: `/debates/${definition.debateId}?tab=definitions`,
        actorId: userId,
        debateId: definition.debateId,
        metadata: createNotificationMetadata("DEFINITION_VOTE", {
          definitionId: definition.id,
          term: definition.term,
          support,
        }),
        sendEmail: true,
      });
    } catch (error) {
      console.error("Failed to create definition vote notification:", error);
    }
  }

  return { success: true, vote };
}
