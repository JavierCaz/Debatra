"use server";

import { prisma } from "@/lib/prisma/client";

export async function searchUsers(query: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    return { users };
  } catch (error) {
    console.error("Error searching users:", error);
    return { error: "Failed to search users" };
  }
}
