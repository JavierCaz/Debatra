import { prisma } from "@/lib/prisma/client";

export async function checkDebateTimeouts() {
  console.log("Checking debate timeouts...");

  const activeDebates = await prisma.debate.findMany({
    where: {
      status: "IN_PROGRESS",
      turnTimeLimit: { not: null },
    },
    include: {
      participants: {
        where: { status: "ACTIVE" },
        include: {
          user: true,
          arguments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      arguments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  for (const debate of activeDebates) {
    const lastArgument = debate.arguments[0];
    if (!lastArgument) continue;

    const turnDeadline = new Date(
      lastArgument.createdAt.getTime() + debate.turnTimeLimit! * 60 * 60 * 1000,
    );

    if (new Date() > turnDeadline) {
      const currentTurnParticipant = debate.participants.find(
        (p) => p.id !== lastArgument.participantId,
      );

      if (currentTurnParticipant) {
        console.log(
          `Timeout for debate ${debate.id}, forfeiting participant ${currentTurnParticipant.userId}`,
        );

        await prisma.debateParticipant.update({
          where: { id: currentTurnParticipant.id },
          data: { status: "FORFEITED" },
        });

        // Find the winning side (opposite of the forfeiting participant's role)
        const winningRole =
          currentTurnParticipant.role === "PROPOSER" ? "OPPOSER" : "PROPOSER";

        await prisma.winCondition.upsert({
          where: { debateId: debate.id },
          create: {
            debateId: debate.id,
            type: "FORFEIT",
            winningRole: winningRole,
            decidedAt: new Date(),
            description: `${currentTurnParticipant.user.name} forfeited due to timeout`,
          },
          update: {
            type: "FORFEIT",
            winningRole: winningRole,
            decidedAt: new Date(),
            description: `${currentTurnParticipant.user.name} forfeited due to timeout`,
          },
        });

        await prisma.debate.update({
          where: { id: debate.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }
    }
  }

  console.log("Timeout check completed");
}
