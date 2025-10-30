"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";

export async function getUnreadNotificationCount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { count: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { count: 0 };
  }

  const count = await prisma.notification.count({
    where: {
      userId: user.id,
      status: "UNREAD",
    },
  });

  return { count };
}

export async function getNotifications(limit = 20, skip = 0) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { notifications: [], total: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { notifications: [], total: 0 };
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        debate: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    }),
    prisma.notification.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  return { notifications, total };
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      status: "UNREAD",
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
      userId: user.id,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Helper function to create notifications (used by other actions)
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  actorId,
  debateId,
  metadata,
}: {
  userId: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  actorId?: string;
  debateId?: string;
  metadata?: any;
}) {
  return await prisma.notification.create({
    data: {
      userId,
      type: type as any,
      title,
      message,
      link,
      actorId,
      debateId,
      metadata,
    },
  });
}
