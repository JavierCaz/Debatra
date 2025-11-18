"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { createNotificationMetadata } from "../../types/notifications";
import type { ParticipantRole } from "../generated/prisma";
import { createNotification } from "./notifications";

export async function sendJoinRequest(
  debateId: string,
  role: ParticipantRole,
  message?: string,
) {
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
      participants: true,
      creator: true,
    },
  });

  if (!debate) {
    return { error: "Debate not found" };
  }

  // Check if user is already a participant
  if (debate.participants.some((p) => p.userId === user.id)) {
    return { error: "You are already a participant" };
  }

  // Check if role is available
  const roleTaken = debate.participants.some((p) => p.role === role);
  if (roleTaken) {
    return { error: `The ${role.toLowerCase()} role is already taken` };
  }

  // Check for existing pending request
  const existingRequest = await prisma.debateRequest.findFirst({
    where: {
      debateId,
      userId: user.id,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    return { error: "You already have a pending request for this debate" };
  }

  try {
    const request = await prisma.debateRequest.create({
      data: {
        debateId,
        userId: user.id,
        type: "JOIN_REQUEST",
        role,
        message,
      },
    });

    // Notify debate creator
    await createNotification({
      userId: debate.creatorId,
      type: "DEBATE_INVITATION",
      title: "New Join Request",
      message: `${user.name || "A user"} wants to join "${debate.title}" as ${role.toLowerCase()}`,
      link: `/debates/${debateId}`,
      actorId: user.id,
      debateId,
      metadata: createNotificationMetadata("DEBATE_INVITATION", {
        requestId: request.id,
        role,
        debateTitle: debate.title,
      }),
      sendEmail: true, // Enable email notifications
    });

    revalidatePath(`/debates/${debateId}`);
    return { success: true, requestId: request.id };
  } catch (error) {
    console.error("Error sending join request:", error);
    return { error: "Failed to send join request" };
  }
}

export async function sendInvitation(
  debateId: string,
  userEmail: string,
  role: ParticipantRole,
  message?: string,
) {
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

  // Check if inviter has permission (creator or participant)
  const isCreator = debate.creatorId === inviter.id;
  const isParticipant = debate.participants.some(
    (p) => p.userId === inviter.id,
  );

  if (!isCreator && !isParticipant) {
    return { error: "You don't have permission to invite users" };
  }

  const invitee = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!invitee) {
    return { error: "User not found" };
  }

  // Check if user is already a participant
  if (debate.participants.some((p) => p.userId === invitee.id)) {
    return { error: "This user is already a participant" };
  }

  // Check if role is available
  const roleTaken = debate.participants.some((p) => p.role === role);
  if (roleTaken) {
    return { error: `The ${role.toLowerCase()} role is already taken` };
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.debateRequest.findFirst({
    where: {
      debateId,
      userId: invitee.id,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    return { error: "This user already has a pending invitation/request" };
  }

  try {
    const invitation = await prisma.debateRequest.create({
      data: {
        debateId,
        userId: invitee.id,
        inviterId: inviter.id,
        type: "INVITATION",
        role,
        message,
      },
    });

    // Notify invitee
    await createNotification({
      userId: invitee.id,
      type: "DEBATE_INVITATION",
      title: "Debate Invitation",
      message: `${inviter.name || "Someone"} invited you to join "${debate.title}" as ${role.toLowerCase()}`,
      link: `/debates/${debateId}`,
      actorId: inviter.id,
      debateId,
      metadata: createNotificationMetadata("DEBATE_INVITATION", {
        requestId: invitation.id,
        role,
        debateTitle: debate.title,
      }),
      sendEmail: true, // Enable email notifications
    });

    revalidatePath(`/debates/${debateId}`);
    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error("Error sending invitation:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function respondToRequest(requestId: string, accept: boolean) {
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

  const request = await prisma.debateRequest.findUnique({
    where: { id: requestId },
    include: {
      debate: {
        include: {
          participants: true,
        },
      },
      user: true,
      inviter: true,
    },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  // Check permissions
  if (request.type === "JOIN_REQUEST") {
    // Only creator can respond to join requests
    if (request.debate.creatorId !== user.id) {
      return { error: "Only the debate creator can respond to join requests" };
    }
  } else {
    // Only the invited user can respond to invitations
    if (request.userId !== user.id) {
      return { error: "You are not authorized to respond to this invitation" };
    }
  }

  try {
    if (accept) {
      // Check if role is still available
      const roleTaken = request.debate.participants.some(
        (p) => p.role === request.role,
      );
      if (roleTaken) {
        await prisma.debateRequest.update({
          where: { id: requestId },
          data: {
            status: "DECLINED",
            respondedAt: new Date(),
          },
        });
        return { error: "This role has already been taken" };
      }

      // Accept the request and create participant
      await prisma.$transaction([
        prisma.debateRequest.update({
          where: { id: requestId },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        }),
        prisma.debateParticipant.create({
          data: {
            debateId: request.debateId,
            userId: request.userId,
            role: request.role,
            status: "ACTIVE",
            respondedAt: new Date(),
          },
        }),
      ]);

      // Check if debate should start (has both PROPOSER and OPPOSER)
      const updatedDebate = await prisma.debate.findUnique({
        where: { id: request.debateId },
        include: { participants: true },
      });

      const hasProposer = updatedDebate?.participants.some(
        (p) => p.role === "PROPOSER",
      );
      const hasOpposer = updatedDebate?.participants.some(
        (p) => p.role === "OPPOSER",
      );

      const isDebateFull = hasProposer && hasOpposer;

      if (isDebateFull && updatedDebate?.status === "OPEN") {
        await prisma.debate.update({
          where: { id: request.debateId },
          data: {
            status: "IN_PROGRESS",
            startedAt: new Date(),
          },
        });

        // Cancel all other pending requests for this debate since it's now full
        const otherPendingRequests = await prisma.debateRequest.findMany({
          where: {
            debateId: request.debateId,
            status: "PENDING",
            id: { not: requestId }, // Exclude the current request that was just accepted
          },
          include: {
            user: true,
            inviter: true,
          },
        });

        if (otherPendingRequests.length > 0) {
          // Update all other pending requests to CANCELLED
          await prisma.debateRequest.updateMany({
            where: {
              debateId: request.debateId,
              status: "PENDING",
              id: { not: requestId },
            },
            data: {
              status: "CANCELLED",
              respondedAt: new Date(),
            },
          });

          // Notify all users whose requests were cancelled
          const notificationPromises = otherPendingRequests.map(
            (cancelledRequest) => {
              let notificationMessage = "";
              let notificationTitle = "";

              if (cancelledRequest.type === "JOIN_REQUEST") {
                notificationTitle = "Join Request Cancelled";
                notificationMessage = `Your request to join "${request.debate.title}" was cancelled because the debate is now full`;
              } else {
                notificationTitle = "Invitation Cancelled";
                notificationMessage = `Your invitation to join "${request.debate.title}" was cancelled because the debate is now full`;
              }

              return createNotification({
                userId: cancelledRequest.userId,
                type: "DEBATE_DECLINED",
                title: notificationTitle,
                message: notificationMessage,
                link: `/debates/${request.debateId}`,
                actorId: user.id,
                debateId: request.debateId,
                metadata: createNotificationMetadata("DEBATE_DECLINED", {
                  requestId: cancelledRequest.id,
                  debateTitle: request.debate.title,
                  role: cancelledRequest.role,
                }),
                sendEmail: true,
              });
            },
          );

          await Promise.all(notificationPromises);
        }
      }

      // Notify relevant parties for the accepted request
      if (request.type === "JOIN_REQUEST") {
        // Notify the requester
        await createNotification({
          userId: request.userId,
          type: "DEBATE_ACCEPTED",
          title: "Join Request Accepted",
          message: `Your request to join "${request.debate.title}" has been accepted`,
          link: `/debates/${request.debateId}`,
          actorId: user.id,
          debateId: request.debateId,
          metadata: createNotificationMetadata("DEBATE_ACCEPTED", {
            requestId: request.id,
            debateTitle: request.debate.title,
            role: request.role,
          }),
          sendEmail: true,
        });
      } else {
        // Notify the inviter
        if (request.inviterId) {
          await createNotification({
            userId: request.inviterId,
            type: "DEBATE_ACCEPTED",
            title: "Invitation Accepted",
            message: `${request.user.name || "A user"} accepted your invitation to "${request.debate.title}"`,
            link: `/debates/${request.debateId}`,
            actorId: request.userId,
            debateId: request.debateId,
            metadata: createNotificationMetadata("DEBATE_ACCEPTED", {
              requestId: request.id,
              debateTitle: request.debate.title,
              role: request.role,
            }),
            sendEmail: true,
          });
        }
      }

      revalidatePath(`/debates/${request.debateId}`);
      return { success: true, accepted: true, debateFull: isDebateFull };
    } else {
      // Decline the request
      await prisma.debateRequest.update({
        where: { id: requestId },
        data: {
          status: "DECLINED",
          respondedAt: new Date(),
        },
      });

      // Notify relevant parties
      if (request.type === "JOIN_REQUEST") {
        await createNotification({
          userId: request.userId,
          type: "DEBATE_DECLINED",
          title: "Join Request Declined",
          message: `Your request to join "${request.debate.title}" was declined`,
          link: `/debates/${request.debateId}`,
          actorId: user.id,
          debateId: request.debateId,
          metadata: createNotificationMetadata("DEBATE_DECLINED", {
            requestId: request.id,
            debateTitle: request.debate.title,
            role: request.role,
          }),
          sendEmail: true,
        });
      } else {
        if (request.inviterId) {
          await createNotification({
            userId: request.inviterId,
            type: "DEBATE_DECLINED",
            title: "Invitation Declined",
            message: `${request.user.name || "A user"} declined your invitation to "${request.debate.title}"`,
            link: `/debates/${request.debateId}`,
            actorId: request.userId,
            debateId: request.debateId,
            metadata: createNotificationMetadata("DEBATE_DECLINED", {
              requestId: request.id,
              debateTitle: request.debate.title,
              role: request.role,
            }),
            sendEmail: true,
          });
        }
      }

      revalidatePath(`/debates/${request.debateId}`);
      return { success: true, accepted: false };
    }
  } catch (error) {
    console.error("Error responding to request:", error);
    return { error: "Failed to respond to request" };
  }
}

export async function cancelRequest(requestId: string) {
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

  const request = await prisma.debateRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  // Check if user owns this request/invitation
  const ownsRequest =
    request.userId === user.id || request.inviterId === user.id;
  if (!ownsRequest) {
    return { error: "You don't have permission to cancel this request" };
  }

  try {
    await prisma.debateRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        respondedAt: new Date(),
      },
    });

    revalidatePath(`/debates/${request.debateId}`);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling request:", error);
    return { error: "Failed to cancel request" };
  }
}

export async function getPendingRequests(debateId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { requests: [] };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { requests: [] };
  }

  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: {
      participants: true,
    },
  });

  if (!debate) {
    return { requests: [] };
  }

  const isCreator = debate.creatorId === user.id;
  const isParticipant = debate.participants.some((p) => p.userId === user.id);

  // Get requests relevant to the user
  const requests = await prisma.debateRequest.findMany({
    where: {
      debateId,
      status: "PENDING",
      OR: [
        // User's own requests/invitations
        { userId: user.id },
        // If creator, see all join requests
        isCreator ? { type: "JOIN_REQUEST" } : {},
        // If participant, see invitations they sent
        isParticipant ? { inviterId: user.id } : {},
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { requests };
}
