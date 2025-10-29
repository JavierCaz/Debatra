import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { CreateDebateClient } from "./create-debate-client";

export default async function CreateDebatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <CreateDebateClient />
    </div>
  );
}
