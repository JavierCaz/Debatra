import { render } from "@react-email/render";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma/client";
import type { NotificationEmailData } from "@/types/email";
import {
  DebateInvitationEmail,
  NotificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
} from "./templates";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string,
) {
  if (!resend) {
    console.warn("Resend not configured - skipping email send");
    return null;
  }

  try {
    const emailHtml = await render(PasswordResetEmail({ resetUrl, userName }));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "",
      to: email,
      subject: "Reset Your Password",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }

    console.log("Password reset email sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  if (!resend) {
    console.warn("Resend not configured - skipping email send");
    return null;
  }

  try {
    const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`;
    const emailHtml = await render(WelcomeEmail({ userName, loginUrl }));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "",
      to: email,
      subject: "Welcome to Debate Platform!",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }

    console.log("Welcome email sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

export async function sendDebateInvitationEmail(
  email: string,
  userName: string,
  debateTitle: string,
  inviterName: string,
  debateId: string,
) {
  if (!resend) {
    console.warn("Resend not configured - skipping email send");
    return null;
  }

  try {
    const debateUrl = `${process.env.NEXTAUTH_URL}/debates/${debateId}`;
    const emailHtml = await render(
      DebateInvitationEmail({
        userName,
        debateTitle,
        inviterName,
        debateUrl,
      }),
    );

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "",
      to: email,
      subject: `You've been invited to debate: ${debateTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending debate invitation:", error);
      throw error;
    }

    console.log("Debate invitation sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send debate invitation:", error);
    throw error;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("Resend not configured - skipping email send");
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Send a notification email for debate events
 */
export async function sendNotificationEmail(
  userId: string,
  notificationData: NotificationEmailData,
) {
  try {
    // Get user email and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        notificationPreference: true,
      },
    });

    if (!user?.email) return;

    // Check if user wants email notifications (default to true if no preference)
    const wantsEmails = user.notificationPreference?.email ?? true;
    if (!wantsEmails) return;

    // Use the React email template
    const emailHtml = await render(
      NotificationEmail({
        title: notificationData.title,
        message: notificationData.message,
        linkUrl: notificationData.link
          ? `${process.env.NEXTAUTH_URL}${notificationData.link}`
          : undefined,
        linkText: "View Notification",
        userName: user.name || undefined,
      }),
    );

    await sendEmail({
      to: user.email,
      subject: notificationData.title,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
    // Don't throw - email failure shouldn't break the main operation
  }
}

/**
 * Send notification emails to multiple users
 */
export async function sendBulkNotificationEmails(
  userIds: string[],
  notificationData: NotificationEmailData,
) {
  // Process emails in background without blocking
  Promise.all(
    userIds.map((userId) => sendNotificationEmail(userId, notificationData)),
  ).catch((error) => {
    console.error("Error in bulk notification emails:", error);
  });
}

/**
 * Send notification emails to all debate participants except excluded users
 */
export async function notifyDebateParticipants(
  debateId: string,
  notificationData: NotificationEmailData,
  excludeUserIds: string[] = [],
) {
  try {
    const participants = await prisma.debateParticipant.findMany({
      where: {
        debateId,
        status: "ACTIVE",
        userId: {
          notIn: excludeUserIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const participantIds = participants.map((p) => p.userId);

    if (participantIds.length === 0) return;

    await sendBulkNotificationEmails(participantIds, {
      ...notificationData,
      link: notificationData.link || `/debates/${debateId}`,
    });
  } catch (error) {
    console.error("Error notifying debate participants:", error);
  }
}
