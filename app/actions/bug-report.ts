"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";

export async function submitBugReport(formData: {
  title: string;
  description: string;
  page?: string;
  browserInfo?: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    await prisma.bugReport.create({
      data: {
        title: formData.title,
        description: formData.description,
        page: formData.page,
        browserInfo: formData.browserInfo,
        userId: session?.user?.id ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting bug report:", error);
    return { error: "Failed to submit bug report. Please try again." };
  }
}
