"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import type { InitialArgument } from "@/types/debate";
import { createNotificationMetadata } from "@/types/notifications";
import { createBulkNotifications } from "./notifications";

export async function submitArguments(
  debateId: string,
  argumentsData: InitialArgument[],
  isForfeit: boolean = false,
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

    for (const arg of argumentsData) {
      const plainText = arg.content.replace(/<[^>]*>/g, "").trim();
      if (plainText.length < 10) {
        throw new Error(
          "Each argument must have at least 10 characters of content",
        );
      }
      if (arg.references.length < basicDebate.minReferences && !isForfeit) {
        throw new Error(
          `Each argument requires at least ${basicDebate.minReferences} reference(s)`,
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (isForfeit) {
        const opponentSide =
          currentParticipant.role === "PROPOSER" ? "OPPOSER" : "PROPOSER";

        for (const argData of argumentsData) {
          const plainText = argData.content.replace(/<[^>]*>/g, "").trim();
          if (plainText.length === 0) continue;

          await tx.argument.create({
            data: {
              content: argData.content,
              turnNumber: basicDebate.currentTurnNumber,
              debateId: debateId,
              participantId: currentParticipant.id,
              authorId: session.user.id,
            },
          });
        }

        await tx.debateParticipant.update({
          where: { id: currentParticipant.id },
          data: {
            status: "FORFEITED",
          },
        });

        const activeParticipantsOnSameSide =
          await tx.debateParticipant.findMany({
            where: {
              debateId: debateId,
              role: currentParticipant.role,
              status: "ACTIVE",
            },
          });

        let updatedDebateData = null;
        let winConditionData = null;

        if (activeParticipantsOnSameSide.length === 0) {
          updatedDebateData = await tx.debate.update({
            where: { id: debateId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              updatedAt: new Date(),
            },
          });

          winConditionData = await tx.winCondition.create({
            data: {
              debateId: debateId,
              type: "FORFEIT",
              winningRole: opponentSide,
              description: `All ${currentParticipant.role.toLowerCase()}s have forfeited. ${opponentSide}s win by forfeit.`,
              decidedAt: new Date(),
            },
          });
        } else {
          const participantsSubmittedThisTurn = await tx.argument.findMany({
            where: {
              debateId: debateId,
              turnNumber: basicDebate.currentTurnNumber,
              participantId: {
                in: activeParticipantsOnSameSide.map((p) => p.id),
              },
            },
            select: {
              participantId: true,
            },
            distinct: ["participantId"],
          });

          if (
            participantsSubmittedThisTurn.length ===
            activeParticipantsOnSameSide.length
          ) {
            updatedDebateData = await tx.debate.update({
              where: { id: debateId },
              data: {
                currentTurnSide: opponentSide,
                updatedAt: new Date(),
              },
            });

            const opponentParticipants = await tx.debateParticipant.findMany({
              where: {
                debateId: debateId,
                role: opponentSide,
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: { id: true },
                },
              },
            });

            if (opponentParticipants.length > 0) {
              const userIds = opponentParticipants.map((p) => p.user.id);
              await createBulkNotifications({
                userIds: userIds,
                type: "NEW_ARGUMENT",
                title: "Your turn to respond",
                message: `The ${currentParticipant.role.toLowerCase()}s have made their arguments for turn ${basicDebate.currentTurnNumber}. It's your turn to respond in the debate "${basicDebate.title}"`,
                link: `/debates/${debateId}`,
                actorId: session.user.id,
                debateId: debateId,
                metadata: createNotificationMetadata("NEW_ARGUMENT", {
                  turnNumber: basicDebate.currentTurnNumber,
                  turnSide: opponentSide,
                  debateTitle: basicDebate.title,
                }),
                sendEmail: true,
              });
            }
          }
        }

        const allParticipants = await tx.debateParticipant.findMany({
          where: {
            debateId: debateId,
            status: { in: ["ACTIVE", "FORFEITED"] },
          },
          include: {
            user: {
              select: { id: true },
            },
          },
        });

        if (allParticipants.length > 0) {
          const userIds = allParticipants.map((p) => p.user.id);
          const isDebateOver = activeParticipantsOnSameSide.length === 0;

          const message = isDebateOver
            ? `The debate "${basicDebate.title}" has ended because all ${currentParticipant.role.toLowerCase()}s have forfeited. ${opponentSide}s win!`
            : `A ${currentParticipant.role.toLowerCase()} has forfeited in the debate "${basicDebate.title}". The debate continues with remaining participants.`;

          await createBulkNotifications({
            userIds: userIds,
            type: isDebateOver ? "DEBATE_COMPLETED" : "NEW_ARGUMENT",
            title: isDebateOver ? "Debate Completed" : "NEW_ARGUMENT",
            message: message,
            link: `/debates/${debateId}`,
            actorId: session.user.id,
            debateId: debateId,
            metadata: createNotificationMetadata(
              isDebateOver ? "DEBATE_COMPLETED" : "NEW_ARGUMENT",
              {
                debateTitle: basicDebate.title,
                winningRole: isDebateOver ? opponentSide : null,
                isForfeit: true,
                forfeitedBy: currentParticipant.role,
                isDebateOver: isDebateOver,
              },
            ),
            sendEmail: true,
          });
        }

        return {
          success: true,
          error: null,
          debate: updatedDebateData || basicDebate,
          winCondition: winConditionData,
        };
      } else {
        for (const argData of argumentsData) {
          let responseToId = null;
          if (argData.responseToId) {
            const targetArgument = await tx.argument.findFirst({
              where: {
                id: argData.responseToId,
                debateId: debateId,
              },
            });

            if (targetArgument) {
              responseToId = argData.responseToId;
            }
          }

          await tx.argument.create({
            data: {
              content: argData.content,
              turnNumber: basicDebate.currentTurnNumber,
              debateId: debateId,
              participantId: currentParticipant.id,
              authorId: session.user.id,
              responseToId: responseToId,
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

        const activeParticipantsOnSameSide =
          await tx.debateParticipant.findMany({
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
              in: activeParticipantsOnSameSide.map((p) => p.id),
            },
          },
          select: {
            participantId: true,
          },
          distinct: ["participantId"],
        });

        let updatedDebateData = null;

        if (
          participantsSubmittedThisTurn.length ===
          activeParticipantsOnSameSide.length
        ) {
          if (basicDebate.currentTurnSide === "PROPOSER") {
            updatedDebateData = await tx.debate.update({
              where: { id: debateId },
              data: {
                currentTurnSide: "OPPOSER",
                updatedAt: new Date(),
              },
            });

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

            if (opposerParticipants.length > 0) {
              await createBulkNotifications({
                userIds: opposerParticipants.map((p) => p.user.id),
                type: "NEW_ARGUMENT",
                title: "Your turn to respond",
                message: `The proposers have made their arguments for turn ${basicDebate.currentTurnNumber}. It's your turn to respond in the debate "${basicDebate.title}"`,
                link: `/debates/${debateId}`,
                actorId: session.user.id,
                debateId: debateId,
                metadata: createNotificationMetadata("NEW_ARGUMENT", {
                  turnNumber: basicDebate.currentTurnNumber,
                  turnSide: "OPPOSER",
                  debateTitle: basicDebate.title,
                }),
                sendEmail: true,
              });
            }
          } else {
            const isLastTurn =
              basicDebate.currentTurnNumber >= basicDebate.turnsPerSide;

            if (isLastTurn) {
              updatedDebateData = await tx.debate.update({
                where: { id: debateId },
                data: {
                  status: "COMPLETED",
                  completedAt: new Date(),
                  updatedAt: new Date(),
                },
              });

              const voteCounts = await calculateTeamVoteCounts(debateId, tx);

              let winningRole: "PROPOSER" | "OPPOSER" | null = null;
              if (voteCounts.proposerVotes > voteCounts.opposerVotes) {
                winningRole = "PROPOSER";
              } else if (voteCounts.opposerVotes > voteCounts.proposerVotes) {
                winningRole = "OPPOSER";
              }

              await tx.winCondition.create({
                data: {
                  debateId: debateId,
                  type: "VOTE_COUNT",
                  winningRole: winningRole,
                  description: winningRole
                    ? `Debate completed after ${basicDebate.turnsPerSide} turns per side. ${winningRole}s won with majority votes.`
                    : `Debate completed after ${basicDebate.turnsPerSide} turns per side. Result: Tie.`,
                  decidedAt: new Date(),
                },
              });

              const allActiveParticipants = await tx.debateParticipant.findMany(
                {
                  where: {
                    debateId: debateId,
                    status: "ACTIVE",
                  },
                  include: {
                    user: {
                      select: { id: true },
                    },
                  },
                },
              );

              if (allActiveParticipants.length > 0) {
                const winnerText = winningRole
                  ? `The ${winningRole.toLowerCase()}s have won the debate!`
                  : "The debate ended in a tie!";

                await createBulkNotifications({
                  userIds: allActiveParticipants.map((p) => p.user.id),
                  type: "DEBATE_COMPLETED",
                  title: "Debate Completed",
                  message: `The debate "${basicDebate.title}" has been completed. ${winnerText}`,
                  link: `/debates/${debateId}`,
                  actorId: session.user.id,
                  debateId: debateId,
                  metadata: createNotificationMetadata("DEBATE_COMPLETED", {
                    debateTitle: basicDebate.title,
                    winningRole: winningRole,
                    totalTurns: basicDebate.turnsPerSide * 2,
                  }),
                  sendEmail: true,
                });
              }
            } else {
              const nextTurnNumber = basicDebate.currentTurnNumber + 1;
              updatedDebateData = await tx.debate.update({
                where: { id: debateId },
                data: {
                  currentTurnSide: "PROPOSER",
                  currentTurnNumber: nextTurnNumber,
                  updatedAt: new Date(),
                },
              });

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

              if (proposerParticipants.length > 0) {
                await createBulkNotifications({
                  userIds: proposerParticipants.map((p) => p.user.id),
                  type: "NEW_ARGUMENT",
                  title: "New turn started",
                  message: `Turn ${nextTurnNumber} has started. It's your turn to present arguments in the debate "${basicDebate.title}"`,
                  link: `/debates/${debateId}`,
                  actorId: session.user.id,
                  debateId: debateId,
                  metadata: createNotificationMetadata("NEW_ARGUMENT", {
                    debateTitle: basicDebate.title,
                    turnNumber: nextTurnNumber,
                    turnSide: "PROPOSER",
                  }),
                  sendEmail: true,
                });
              }
            }
          }
        }

        return {
          success: true,
          error: null,
          debate: updatedDebateData || basicDebate,
        };
      }
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

async function calculateTeamVoteCounts(debateId: string, tx: any) {
  const argumentsWithVotes = await tx.argument.findMany({
    where: { debateId },
    include: {
      votes: true,
      participant: {
        select: { role: true },
      },
    },
  });

  let proposerVotes = 0;
  let opposerVotes = 0;

  argumentsWithVotes.forEach((argument: any) => {
    const supportVotes = argument.votes.filter(
      (vote: any) => vote.support,
    ).length;
    const opposeVotes = argument.votes.filter(
      (vote: any) => !vote.support,
    ).length;
    const netVotes = supportVotes - opposeVotes;

    if (argument.participant.role === "PROPOSER") {
      proposerVotes += netVotes;
    } else {
      opposerVotes += netVotes;
    }
  });

  return { proposerVotes, opposerVotes };
}
