import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Create debate with participant and opening argument in a transaction
    const debate = await prisma.$transaction(async (tx) => {
      // Create the debate
      const newDebate = await tx.debate.create({
        data: {
          title: data.title,
          topic: data.topic,
          description: data.description,
          format: data.format,
          maxParticipants: data.maxParticipants,
          turnsPerSide: data.turnsPerSide,
          turnTimeLimit: data.turnTimeLimit,
          minReferences: data.minReferences,
          status: data.status,
          creatorId: user.id,
        },
      });

      // Create participant
      const participant = await tx.debateParticipant.create({
        data: {
          debateId: newDebate.id,
          userId: user.id,
          role: "PROPOSER",
          status: "ACTIVE",
        },
      });

      // Create opening argument with references
      await tx.argument.create({
        data: {
          content: data.openingStatement,
          turnNumber: 1,
          debateId: newDebate.id,
          participantId: participant.id,
          authorId: user.id,
          references: {
            create: data.references.map((ref: any) => ({
              type: "WEBSITE",
              title: ref.title,
              url: ref.url,
            })),
          },
        },
      });

      return newDebate;
    });

    return NextResponse.json(debate, { status: 201 });
  } catch (error) {
    console.error("Error creating debate:", error);
    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 },
    );
  }
}
