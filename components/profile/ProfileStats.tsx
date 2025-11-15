import { Handshake, MessageSquare, ThumbsUp, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

interface ProfileStatsProps {
  stats: {
    debatesCreated: number;
    debateParticipants: number;
    arguments: number;
    votes: number;
    concessions: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: "Debates Created",
      value: stats.debatesCreated,
      icon: Trophy,
    },
    {
      label: "Participated In",
      value: stats.debateParticipants,
      icon: MessageSquare,
    },
    {
      label: "Arguments Made",
      value: stats.arguments,
      icon: MessageSquare,
    },
    {
      label: "Concessions Made",
      value: stats.concessions,
      icon: Handshake,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statItems.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <IconComponent className="mr-2 h-4 w-4" />
                {stat.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
