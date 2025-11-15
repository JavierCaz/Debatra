import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { argumentVoteConfig } from "@/lib/vote/config";
import { handleVote } from "@/lib/vote/handler";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { argumentId, support } = await request.json();

    if (!argumentId || typeof support !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await handleVote(
      argumentId,
      support,
      session.user.id,
      argumentVoteConfig,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error voting on argument:", error);

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
