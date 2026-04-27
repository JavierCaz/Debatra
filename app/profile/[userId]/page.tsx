import { Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getNotificationPreferences } from "@/app/actions/notifications";
import type { Prisma } from "@/app/generated/prisma";
import { DebateFiltersClient } from "@/components/debate/browse/debate-filters-client";
import { DebateList } from "@/components/profile/DebateList";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SettingsForm } from "@/components/profile/SettingsForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma/client";
import type { DebateStatus, DebateTopic } from "@/types/debate";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<{
    status?: string;
    search?: string;
    topic?: string;
  }>;
}

async function getUserProfile(
  userId: string,
  filters?: {
    status?: string;
    search?: string;
    topic?: string;
  },
) {
  const whereConditions: Prisma.DebateWhereInput = {
    OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
  };

  // Add status filter if provided
  if (filters?.status && filters.status !== "ALL") {
    whereConditions.status = filters.status as DebateStatus;
  }

  // Add search filter if provided
  if (filters?.search) {
    whereConditions.OR = [
      ...(whereConditions.OR || []),
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Add topic filter if provided
  if (filters?.topic && filters.topic !== "ALL") {
    whereConditions.topics = {
      some: {
        topic: filters.topic as DebateTopic,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      debatesCreated: {
        where: whereConditions,
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          topics: true,
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
        where: {
          debate: whereConditions,
        },
        include: {
          debate: {
            include: {
              creator: true,
              topics: true,
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
        take: 10,
      },
      _count: {
        select: {
          debatesCreated: {
            where: whereConditions,
          },
          debateParticipants: {
            where: {
              debate: whereConditions,
            },
          },
          arguments: true,
          votes: true,
          concessions: true,
        },
      },
    },
  });

  return user;
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const userId = (await params).userId;
  const session = await getServerSession();
  const filters = await searchParams;

  const status = filters.status || "ALL";
  const search = filters.search || "";
  const topic = filters.topic || "ALL";

  const user = await getUserProfile(userId, filters);
  const { preferences } = await getNotificationPreferences();

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.email === user.email;

  const initials = (user.name || user.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="mb-8 pt-0">
        <CardHeader className="pb-0 px-0">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 -mt-16">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "User"}
              />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">
                    {user.name || "Anonymous User"}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {user.email}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isOwnProfile && (
                    <>
                      <EditProfileForm user={user} />
                      <SettingsForm initialPreferences={preferences} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {user.bio && (
            <>
              <p className="text-muted-foreground">{user.bio}</p>
              <Separator className="my-4" />
            </>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <ProfileStats stats={user._count} />

      <div className="mt-8">
        <Tabs defaultValue="created" className="w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="sticky top-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Debates</CardTitle>
                    <CardDescription>
                      Narrow down debates by status, topic, or search
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tabs Navigation inside CardContent */}
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="created">
                        Created ({user._count.debatesCreated})
                      </TabsTrigger>
                      <TabsTrigger value="participated">
                        Participated ({user._count.debateParticipants})
                      </TabsTrigger>
                    </TabsList>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-3">Filters</h3>
                      <DebateFiltersClient
                        initialStatus={status}
                        initialSearch={search}
                        initialTopic={topic}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:w-2/3">
              <TabsContent value="created" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Created Debates</CardTitle>
                    <CardDescription>
                      Debates created by {user.name || "this user"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.debatesCreated.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No debates found
                        </p>
                        {status !== "ALL" || search || topic !== "ALL" ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your filters
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            {user.name || "This user"} hasn't created any
                            debates yet
                          </p>
                        )}
                      </div>
                    ) : (
                      <DebateList items={user.debatesCreated} type="created" />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Participated Debates Tab */}
              <TabsContent value="participated" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Participated Debates</CardTitle>
                    <CardDescription>
                      Debates {user.name || "this user"} has participated in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.debateParticipants.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No debates found
                        </p>
                        {status !== "ALL" || search || topic !== "ALL" ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your filters
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            {user.name || "This user"} hasn't participated in
                            any debates yet
                          </p>
                        )}
                      </div>
                    ) : (
                      <DebateList
                        items={user.debateParticipants}
                        type="participated"
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
