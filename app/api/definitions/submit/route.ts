import { NextResponse } from "next/server";
import { submitDefinition } from "@/app/actions/debates";

export async function POST(request: Request) {
  try {
    const { debateId, definitionData } = await request.json();

    if (!debateId || !definitionData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await submitDefinition(debateId, definitionData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in definition submission API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
