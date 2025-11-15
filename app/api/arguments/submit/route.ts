import { type NextRequest, NextResponse } from "next/server";
import { submitDebateArguments } from "@/app/actions/debates";

export async function POST(request: NextRequest) {
  try {
    const { debateId, arguments: argumentsData } = await request.json();

    if (!debateId || !argumentsData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await submitDebateArguments(debateId, argumentsData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in arguments API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
