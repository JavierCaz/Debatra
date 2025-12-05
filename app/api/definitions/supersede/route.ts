import { NextResponse } from "next/server";
import { supersedeDefinition } from "@/app/actions/definitions";

export async function POST(request: Request) {
  try {
    const { originalDefinitionId, newDefinitionData } = await request.json();

    if (!originalDefinitionId || !newDefinitionData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await supersedeDefinition(
      originalDefinitionId,
      newDefinitionData,
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in definition supersedence API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
