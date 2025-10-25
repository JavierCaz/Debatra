import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { DebateList } from "@/components/profile/DebateList";
import { EditProfileButton } from "@/components/profile/EditProfileButton";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Avatar } from "@/components/ui/Avatar";
import { prisma } from "@/lib/prisma/client";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      debatesCreated: {
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              arguments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      debateParticipants: {
        include: {
          debate: {
            include: {
              creator: true,
              _count: {
                select: {
                  arguments: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 10,
      },
      arguments: {
        include: {
          debate: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          debatesCreated: true,
          debateParticipants: true,
          arguments: true,
          votes: true,
          concessions: true,
        },
      },
    },
  });

  return user;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession();
  const { userId } = await params;
  const user = await getUserProfile(userId);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.email === user.email;

  // Calculate additional stats
  const totalUpvotes = user.arguments.reduce(
    (sum, arg) => sum + arg._count.votes,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <Avatar
                src={user.image}
                name={user.name || user.email}
                size="xl"
                className="ring-4 ring-white"
              />
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between mt-16">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.name || "Anonymous User"}
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  {isOwnProfile && <EditProfileButton />}
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4">
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <span>
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <ProfileStats
          stats={{
            debatesCreated: user._count.debatesCreated,
            debatesParticipated: user._count.debateParticipants,
            totalArguments: user._count.arguments,
            upvotesReceived: totalUpvotes,
            concessionsMade: user._count.concessions,
          }}
        />

        {/* Debates Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Created Debates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Created Debates ({user._count.debatesCreated})
            </h2>
            <DebateList debates={user.debatesCreated} type="created" />
          </div>

          {/* Participated Debates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Participated In ({user._count.debateParticipants})
            </h2>
            <DebateList
              debates={user.debateParticipants.map((p) => p.debate)}
              type="participated"
            />
          </div>
        </div>

        {/* Recent Arguments */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Arguments
          </h2>
          <div className="space-y-4">
            {user.arguments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No arguments yet</p>
            ) : (
              user.arguments.map((argument) => (
                <div
                  key={argument.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {argument.debate.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(argument.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {argument.content}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>👍 {argument._count.votes} votes</span>
                    <span className="mx-2">•</span>
                    <span>Turn {argument.turnNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
