import { NextResponse } from "next/server";
import { endorseDefinition } from "@/app/actions/debates";

export async function POST(request: Request) {
  try {
    const { definitionId } = await request.json();

    if (!definitionId) {
      return NextResponse.json(
        { success: false, error: "Missing definition ID" },
        { status: 400 },
      );
    }

    const result = await endorseDefinition(definitionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in definition endorsement API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
