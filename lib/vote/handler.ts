import { prisma } from "@/lib/prisma/client";

interface VoteConfig {
  itemType: "argument" | "definition";
  voteModel: "argumentVote" | "definitionVote";
  notificationType: "ARGUMENT_VOTE" | "DEFINITION_VOTE";
  includeRelations: any;
  getAuthorId: (item: any) => string;
  generateLink: (item: any) => string;
  generateMessage: (item: any, userName: string, voteType: string) => string;
  generateMetadata: (item: any, voteType: string) => any;
}

export async function handleVote(
  itemId: string,
  support: boolean,
  userId: string,
  config: VoteConfig,
) {
  const {
    itemType,
    voteModel,
    notificationType,
    includeRelations,
    getAuthorId,
    generateLink,
    generateMessage,
    generateMetadata,
  } = config;

  // Check if item exists
  const item = await (prisma as any)[itemType].findUnique({
    where: { id: itemId },
    include: includeRelations,
  });

  if (!item) {
    throw new Error(`${itemType} not found`);
  }

  // Check if user has already voted
  const existingVote = await (prisma as any)[voteModel].findUnique({
    where: {
      [`${itemType}Id_userId`]: {
        [`${itemType}Id`]: itemId,
        userId,
      },
    },
  });

  let result: any;

  if (existingVote) {
    // Update existing vote if different
    if (existingVote.support !== support) {
      result = await (prisma as any)[voteModel].update({
        where: {
          [`${itemType}Id_userId`]: {
            [`${itemType}Id`]: itemId,
            userId,
          },
        },
        data: { support },
      });
    } else {
      // Remove vote if clicking the same button
      result = await (prisma as any)[voteModel].delete({
        where: {
          [`${itemType}Id_userId`]: {
            [`${itemType}Id`]: itemId,
            userId,
          },
        },
      });
    }
  } else {
    // Create new vote
    result = await (prisma as any)[voteModel].create({
      data: {
        [`${itemType}Id`]: itemId,
        userId,
        support,
      },
    });
  }

  // Create notification for the author (only if different user)
  const authorId = getAuthorId(item);
  if (authorId !== userId) {
    try {
      const voteType = support ? "supported" : "opposed";
      const userName =
        (await prisma.user.findUnique({ where: { id: userId } }))?.name ||
        "Someone";

      await prisma.notification.create({
        data: {
          type: notificationType,
          title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${voteType}`,
          message: generateMessage(item, userName, voteType),
          link: generateLink(item),
          userId: authorId,
          actorId: userId,
          debateId: item.debateId,
          ...(itemType === "argument" && { argumentId: item.id }),
          metadata: generateMetadata(item, voteType),
        },
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail the whole request if notification fails
    }
  }

  return { success: true, vote: result };
}
