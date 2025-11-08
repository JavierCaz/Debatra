import { NextResponse } from "next/server";
import { voteOnDefinition } from "@/app/actions/debates";

export async function POST(request: Request) {
  try {
    const { definitionId, support } = await request.json();

    if (!definitionId || typeof support !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await voteOnDefinition(definitionId, support);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in definition vote API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
