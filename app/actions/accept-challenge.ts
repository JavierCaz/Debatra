"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { createNotification } from "./notifications";

export async function acceptDebateChallenge(
  debateId: string,
  role: "PROPOSER" | "OPPOSER",
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "You must be logged in to accept a debate challenge" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  // Get the debate with participants
  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      creator: true,
    },
  });

  if (!debate) {
    return { error: "Debate not found" };
  }

  // Check if debate is open for participants
  if (debate.status !== "OPEN") {
    return { error: "This debate is not accepting participants" };
  }

  // Check if user is already a participant
  const existingParticipant = debate.participants.find(
    (p) => p.userId === user.id,
  );

  if (existingParticipant) {
    return { error: "You are already a participant in this debate" };
  }

  // Check if the role is already taken
  const roleTaken = debate.participants.some((p) => p.role === role);
  if (roleTaken) {
    return { error: `The ${role.toLowerCase()} role is already taken` };
  }

  // Check if debate is full
  if (debate.participants.length >= debate.maxParticipants) {
    return { error: "This debate is full" };
  }

  try {
    // Create the participant
    const participant = await prisma.debateParticipant.create({
      data: {
        debateId: debate.id,
        userId: user.id,
        role,
        status: "ACTIVE",
        respondedAt: new Date(),
      },
    });

    // Update debate status if it's now full
    const participantCount = debate.participants.length + 1;
    if (participantCount >= debate.maxParticipants) {
      await prisma.debate.update({
        where: { id: debate.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });
    }

    // Create notification for debate creator
    await createNotification({
      userId: debate.creatorId,
      type: "DEBATE_ACCEPTED",
      title: "Debate Challenge Accepted!",
      message: `${user.name || "A user"} has accepted your debate challenge "${debate.title}" as ${role.toLowerCase()}`,
      link: `/debates/${debate.id}`,
      actorId: user.id,
      debateId: debate.id,
      metadata: {
        participantRole: role,
      },
    });

    // Notify other participants if any
    for (const p of debate.participants) {
      if (p.userId !== user.id && p.userId !== debate.creatorId) {
        await createNotification({
          userId: p.userId,
          type: "DEBATE_ACCEPTED",
          title: "New Participant Joined",
          message: `${user.name || "A user"} has joined the debate "${debate.title}" as ${role.toLowerCase()}`,
          link: `/debates/${debate.id}`,
          actorId: user.id,
          debateId: debate.id,
        });
      }
    }

    revalidatePath("/debates");
    revalidatePath(`/debates/${debateId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      participantId: participant.id,
      debateStatus:
        participantCount >= debate.maxParticipants ? "IN_PROGRESS" : "OPEN",
    };
  } catch (error) {
    console.error("Error accepting debate challenge:", error);
    return { error: "Failed to accept debate challenge" };
  }
}

export async function declineDebateChallenge(debateId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "You must be logged in" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: {
      creator: true,
    },
  });

  if (!debate) {
    return { error: "Debate not found" };
  }

  // Create notification for debate creator
  await createNotification({
    userId: debate.creatorId,
    type: "DEBATE_DECLINED",
    title: "Debate Challenge Declined",
    message: `${user.name || "A user"} has declined your debate challenge "${debate.title}"`,
    link: `/debates/${debate.id}`,
    actorId: user.id,
    debateId: debate.id,
  });

  revalidatePath("/debates");
  return { success: true };
}

export async function inviteToDebate(debateId: string, userEmail: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "You must be logged in" };
  }

  const inviter = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!inviter) {
    return { error: "User not found" };
  }

  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: {
      participants: true,
    },
  });

  if (!debate) {
    return { error: "Debate not found" };
  }

  // Check if user is creator or participant
  const isCreator = debate.creatorId === inviter.id;
  const isParticipant = debate.participants.some(
    (p) => p.userId === inviter.id,
  );

  if (!isCreator && !isParticipant) {
    return {
      error: "You don't have permission to invite users to this debate",
    };
  }

  const invitee = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!invitee) {
    return { error: "User not found" };
  }

  // Check if user is already invited or participating
  const existingParticipant = debate.participants.find(
    (p) => p.userId === invitee.id,
  );

  if (existingParticipant) {
    return { error: "This user is already participating in the debate" };
  }

  // Create notification
  await createNotification({
    userId: invitee.id,
    type: "DEBATE_INVITATION",
    title: "Debate Invitation",
    message: `${inviter.name || "Someone"} has invited you to join the debate "${debate.title}"`,
    link: `/debates/${debate.id}`,
    actorId: inviter.id,
    debateId: debate.id,
  });

  return { success: true };
}

export async function getOpenDebates(limit = 10) {
  const debates = await prisma.debate.findMany({
    where: {
      status: "OPEN",
    },
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
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return debates;
}
