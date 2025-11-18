import { Calendar, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getNotificationPreferences } from "@/app/actions/notifications";
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
        take: 10,
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
  const userId = (await params).userId;
  const session = await getServerSession();
  const user = await getUserProfile(userId);
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

      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created">
            Created Debates ({user._count.debatesCreated})
          </TabsTrigger>
          <TabsTrigger value="participated">
            Participated ({user._count.debateParticipants})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="mt-6">
          <DebateList items={user.debatesCreated} type="created" />
        </TabsContent>

        <TabsContent value="participated" className="mt-6">
          <DebateList items={user.debateParticipants} type="participated" />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Arguments</CardTitle>
          <CardDescription>Latest contributions to debates</CardDescription>
        </CardHeader>
        <CardContent>
          {user.arguments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No arguments yet
            </p>
          ) : (
            <div className="space-y-4">
              {user.arguments.map((argument) => (
                <div
                  key={argument.id}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/debates/${argument.debate.id}`}>
                      <span className="text-sm font-medium hover:text-primary cursor-pointer">
                        {argument.debate.title}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {new Date(argument.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {argument.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{argument._count.votes} votes</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span>Turn {argument.turnNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
