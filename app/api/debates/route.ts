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

    // Validate required data
    if (!data.title || !data.topic) {
      return NextResponse.json(
        { error: "Title and topic are required" },
        { status: 400 },
      );
    }

    if (
      !data.initialArguments ||
      !Array.isArray(data.initialArguments) ||
      data.initialArguments.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one initial argument is required" },
        { status: 400 },
      );
    }

    // Create debate with participant and multiple initial arguments in a transaction
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

      // Create multiple initial arguments with their references
      for (const initialArg of data.initialArguments) {
        // Validate argument content
        const plainText = initialArg.content.replace(/<[^>]*>/g, "").trim();
        if (!plainText || plainText.length < 10) {
          throw new Error(
            "Each argument must have at least 10 characters of content",
          );
        }

        await tx.argument.create({
          data: {
            content: initialArg.content,
            turnNumber: 1,
            debateId: newDebate.id,
            participantId: participant.id,
            authorId: user.id,
            references: {
              create: initialArg.references.map((ref: any) => ({
                type: detectReferenceType(ref.url),
                title: ref.title,
                url: ref.url,
                author: ref.author,
                publication: ref.publication,
                notes: ref.notes,
              })),
            },
          },
          include: {
            references: true, // Include references in the response if needed
          },
        });
      }

      return newDebate;
    });

    // Fetch the complete debate with participants and arguments
    const completeDebate = await prisma.debate.findUnique({
      where: { id: debate.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            arguments: {
              include: {
                references: true,
                _count: {
                  select: {
                    rebuttals: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(completeDebate, { status: 201 });
  } catch (error) {
    console.error("Error creating debate:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 },
    );
  }
}
