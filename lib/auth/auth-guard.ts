import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  return { error: null, session };
}
