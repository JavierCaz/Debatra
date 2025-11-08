import { NextResponse } from "next/server";
import { acceptDefinition } from "@/app/actions/debates";

export async function POST(request: Request) {
  try {
    const { definitionId } = await request.json();

    if (!definitionId) {
      return NextResponse.json(
        { success: false, error: "Missing definition ID" },
        { status: 400 },
      );
    }

    const result = await acceptDefinition(definitionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in definition acceptance API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
