import { type NextRequest, NextResponse } from "next/server";
import { checkDebateTimeouts } from "@/lib/jobs/check-debate-timeouts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkDebateTimeouts();

    return NextResponse.json({
      success: true,
      message: "Timeout check completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in timeout check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
