"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import type { NotificationMetadata } from "@/types/notifications";
import type { NotificationType } from "../generated/prisma";

export async function getUnreadNotificationCount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { count: 0 };
  }

  const count = await prisma.notification.count({
    where: {
      userId: session.user.id,
      status: "UNREAD",
    },
  });

  return { count };
}

export async function getNotifications(limit = 20, skip = 0) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { notifications: [], total: 0 };
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: session.user.id,
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
        userId: session.user.id,
      },
    }),
  ]);

  return { notifications, total };
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
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
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
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
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getNotificationPreferences() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const preferences = await prisma.userNotificationPreference.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Return defaults if no preferences exist
    return {
      preferences: preferences || {
        inApp: true,
        email: true,
        push: false,
      },
    };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw new Error("Failed to fetch notification preferences");
  }
}

export async function updateNotificationPreferences(preferences: {
  inApp?: boolean;
  email?: boolean;
  push?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const updatedPreferences = await prisma.userNotificationPreference.upsert({
      where: {
        userId: session.user.id,
      },
      update: preferences,
      create: {
        userId: session.user.id,
        ...preferences,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true, preferences: updatedPreferences };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { error: "Failed to update notification preferences" };
  }
}

// ENHANCED: Helper function to create notifications with preference checking
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  actorId,
  debateId,
  metadata,
  sendEmail = false, // Optional email sending
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  actorId?: string;
  debateId?: string;
  metadata?: NotificationMetadata;
  sendEmail?: boolean;
}) {
  try {
    // Check user preferences for in-app notifications
    const userPreferences = await prisma.userNotificationPreference.findUnique({
      where: { userId },
    });

    const allowInApp = userPreferences?.inApp ?? true;

    if (!allowInApp) {
      // User has disabled in-app notifications
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        actorId,
        debateId,
        metadata,
      },
    });

    // Trigger email notification if requested and user allows emails
    if (sendEmail) {
      const allowEmail = userPreferences?.email ?? true;
      if (allowEmail) {
        // Import dynamically to avoid circular dependencies
        const { sendNotificationEmail } = await import("@/lib/email/service");

        // Send email in background without blocking
        sendNotificationEmail(userId, {
          title,
          message,
          link,
        }).catch((error) => {
          console.error("Failed to send notification email:", error);
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Bulk notification creation with preferences
export async function createBulkNotifications({
  userIds,
  type,
  title,
  message,
  link,
  actorId,
  debateId,
  metadata,
  sendEmail = false,
}: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  actorId?: string;
  debateId?: string;
  metadata?: any;
  sendEmail?: boolean;
}) {
  try {
    if (userIds.length === 0) return [];

    // Get preferences for all users at once
    const userPreferences = await prisma.userNotificationPreference.findMany({
      where: {
        userId: { in: userIds },
      },
    });

    const preferencesMap = new Map(
      userPreferences.map((pref) => [pref.userId, pref]),
    );

    // Filter users who allow in-app notifications
    const allowedUserIds = userIds.filter((userId) => {
      const prefs = preferencesMap.get(userId);
      return prefs?.inApp ?? true; // Default to true if no preferences
    });

    if (allowedUserIds.length === 0) return [];

    const notifications = await prisma.$transaction(
      allowedUserIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
            link,
            actorId,
            debateId,
            metadata,
          },
        }),
      ),
    );

    // Send emails to users who allow them
    if (sendEmail) {
      const { sendBulkNotificationEmails } = await import(
        "@/lib/email/service"
      );

      const emailUserIds = allowedUserIds.filter((userId) => {
        const prefs = preferencesMap.get(userId);
        return prefs?.email ?? true; // Default to true if no preferences
      });

      if (emailUserIds.length > 0) {
        sendBulkNotificationEmails(emailUserIds, {
          title,
          message,
          link,
        }).catch((error) => {
          console.error("Failed to send bulk notification emails:", error);
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
}

// Clean up old notifications (keep only last 100 per user)
export async function cleanupOldNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const oldNotifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: 100, // Keep only the 100 most recent
      select: { id: true },
    });

    if (oldNotifications.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: { in: oldNotifications.map((n) => n.id) },
        },
      });
    }

    return { success: true, deletedCount: oldNotifications.length };
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    return { error: "Failed to clean up notifications" };
  }
}

// Get notification statistics
export async function getNotificationStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const [unreadCount, totalCount, readCount] = await Promise.all([
      prisma.notification.count({
        where: {
          userId: session.user.id,
          status: "UNREAD",
        },
      }),
      prisma.notification.count({
        where: { userId: session.user.id },
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          status: "READ",
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        unreadCount,
        totalCount,
        readCount,
      },
    };
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return { error: "Failed to fetch notification statistics" };
  }
}
