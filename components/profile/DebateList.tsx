import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Debate {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: Date;
  _count?: {
    arguments: number;
  };
  participants?: Array<{ id: string }>;
}

interface Participation {
  id: string;
  role: string;
  joinedAt: Date;
  debate: Debate;
}

interface DebateListProps {
  items: (Debate | Participation)[];
  type: "created" | "participated";
}

const statusVariant = {
  DRAFT: "secondary",
  OPEN: "default",
  IN_PROGRESS: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
} as const;

export function DebateList({ items, type }: DebateListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {type === "created"
              ? "No debates created yet"
              : "No debate participations yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const debate =
          type === "created"
            ? (item as Debate)
            : (item as Participation).debate;

        const participation =
          type === "participated" ? (item as Participation) : null;

        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/debates/${debate.id}`}>
                    <CardTitle className="hover:text-primary cursor-pointer">
                      {debate.title}
                    </CardTitle>
                  </Link>
                  {type === "created" && debate.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {debate.description}
                    </CardDescription>
                  )}
                  {type === "participated" && participation && (
                    <CardDescription className="mt-2">
                      Role:{" "}
                      <Badge variant="outline">{participation.role}</Badge>
                    </CardDescription>
                  )}
                </div>
                <Badge
                  variant={
                    statusVariant[debate.status as keyof typeof statusVariant]
                  }
                >
                  {debate.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {type === "created" ? (
                  <>
                    <span>
                      {new Date(debate.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{debate._count?.arguments || 0} arguments</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{debate.participants?.length || 0} participants</span>
                  </>
                ) : (
                  <>
                    <span>
                      Joined{" "}
                      {participation?.joinedAt
                        ? new Date(participation.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{debate._count?.arguments || 0} arguments</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
