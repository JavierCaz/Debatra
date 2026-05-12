"use client";

import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getRoleBadgeColor,
  getRoleTranslationKey,
} from "@/lib/debate/formatters";
import { cn } from "@/lib/utils";
import type { DebateWithDetails } from "@/types/debate";
import { SafeContentRenderer } from "../safe-content-renderer";

interface ArgumentThreadItemProps {
  argument: DebateWithDetails["participants"][0]["arguments"][0];
  participant: DebateWithDetails["participants"][0];
  onClick?: () => void;
}

export function ArgumentThreadItem({
  argument,
  participant,
  onClick,
}: ArgumentThreadItemProps) {
  const { t } = useTranslation();
  const user = participant?.user;
  const userName = user?.name || user?.email || t("debate.content.unknownUser");
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = participant?.role || "OPPOSER";

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-auto p-0 border rounded-lg transition-colors text-left",
        "bg-card hover:bg-muted/20 hover:shadow-md",
      )}
      style={{
        display: "block",
        textAlign: "left" as const,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="p-4 w-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{userName}</span>

              <Badge
                variant="outline"
                className={cn("text-xs", getRoleBadgeColor(userRole))}
              >
                {t(getRoleTranslationKey(userRole))}
              </Badge>

              <span className="text-xs text-muted-foreground">
                {t("debate.argumentList.turnLabel", {
                  number: argument.turnNumber,
                })}
              </span>

              <span className="text-xs text-muted-foreground">
                {format(new Date(argument.createdAt), "PPp")}
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <SafeContentRenderer content={argument.content} />
        </div>
      </div>
    </Button>
  );
}
