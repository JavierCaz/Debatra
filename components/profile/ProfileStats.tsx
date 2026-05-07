"use client";

import { Handshake, MessageSquare, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";

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
  const { t } = useTranslation();

  const statItems = [
    {
      label: t("profile.debatesCreated"),
      value: stats.debatesCreated,
      icon: Trophy,
    },
    {
      label: t("profile.participatedIn"),
      value: stats.debateParticipants,
      icon: Handshake,
    },
    {
      label: t("profile.argumentsMade"),
      value: stats.arguments,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {statItems.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={stat.label}
            className="flex flex-col items-center text-center p-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </Card>
        );
      })}
    </div>
  );
}
