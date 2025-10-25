import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { prisma } from "@/lib/prisma/client";

async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
    },
  });

  return user;
}

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>
          <EditProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
