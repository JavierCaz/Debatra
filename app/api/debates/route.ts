import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Reference } from "@/app/generated/prisma";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { detectReferenceType } from "@/lib/utils/reference-types";
import {
  ALL_DEBATE_TOPICS,
  DebateFormat,
  type DebateTopic,
} from "@/types/debate";

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

    // Validate required data - updated for multiple topics
    if (
      !data.title ||
      !data.topics ||
      !Array.isArray(data.topics) ||
      data.topics.length === 0
    ) {
      return NextResponse.json(
        { error: "Title and at least one topic are required" },
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

    const invalidTopics = data.topics.filter(
      (topic: string) => !ALL_DEBATE_TOPICS.includes(topic as DebateTopic),
    );
    if (invalidTopics.length > 0) {
      return NextResponse.json(
        { error: `Invalid topics provided: ${invalidTopics.join(", ")}` },
        { status: 400 },
      );
    }

    // Create debate with topics, participant, arguments, and definitions in a transaction
    const debate = await prisma.$transaction(async (tx) => {
      const shouldStartWithOpposer =
        data.format === DebateFormat.ONE_VS_ONE ||
        data.format === DebateFormat.ONE_VS_MANY;

      // Create the debate
      const newDebate = await tx.debate.create({
        data: {
          title: data.title,
          description: data.description,
          format: data.format,
          maxParticipants: data.maxParticipants,
          turnsPerSide: data.turnsPerSide,
          turnTimeLimit: data.turnTimeLimit,
          minReferences: data.minReferences,
          status: data.status,
          creatorId: user.id,
          currentTurnSide: shouldStartWithOpposer ? "OPPOSER" : "PROPOSER",
          currentTurnNumber: 1,
        },
      });

      // Create debate topics
      await tx.debateTopic.createMany({
        data: data.topics.map((topic: string) => ({
          debateId: newDebate.id,
          topic: topic,
        })),
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
              create:
                initialArg.references?.map((ref: Reference) => ({
                  type: detectReferenceType(ref.url ?? ""),
                  title: ref.title,
                  url: ref.url,
                  author: ref.author,
                  publication: ref.publication,
                  publishedAt: ref.publishedAt
                    ? new Date(ref.publishedAt)
                    : null,
                  accessedAt: ref.accessedAt
                    ? new Date(ref.accessedAt)
                    : new Date(),
                  notes: ref.notes,
                })) || [],
            },
          },
        });
      }

      // Create definitions with their references if provided
      if (data.initialDefinitions && Array.isArray(data.initialDefinitions)) {
        for (const definition of data.initialDefinitions) {
          // Validate definition data
          if (!definition.term?.trim() || !definition.definition?.trim()) {
            throw new Error(
              "Each definition must have both term and definition",
            );
          }

          await tx.definition.create({
            data: {
              term: definition.term.trim(),
              definition: definition.definition.trim(),
              context: definition.context?.trim(),
              status: "PROPOSED",
              debateId: newDebate.id,
              proposerId: user.id,
              references: {
                create:
                  definition.references?.map((ref: Reference) => ({
                    type: detectReferenceType(ref.url ?? ""),
                    title: ref.title,
                    url: ref.url,
                    author: ref.author,
                    publication: ref.publication,
                    publishedAt: ref.publishedAt
                      ? new Date(ref.publishedAt)
                      : null,
                    accessedAt: ref.accessedAt
                      ? new Date(ref.accessedAt)
                      : new Date(),
                    notes: ref.notes,
                  })) || [],
              },
            },
          });
        }
      }

      return newDebate;
    });

    // Fetch the complete debate with topics, participants, arguments, and definitions
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
        topics: true,
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
                    responses: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
        definitions: {
          include: {
            proposer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            references: true,
            _count: {
              select: {
                votes: true,
                endorsements: true,
                argumentReferences: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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
