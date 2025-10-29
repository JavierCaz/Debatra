"use client";

import { ArrowUpRight, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DebateWithDetails } from "@/types/debate";

interface RebuttalIndicatorProps {
  rebuttalTo: DebateWithDetails["participants"][0]["arguments"][0]["rebuttalTo"];
}

const getPlainTextPreview = (
  content: string,
  maxLength: number = 200,
): string => {
  const stripped = content.replace(/<[^>]*>/g, "");
  const decoded = stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  if (decoded.length <= maxLength) return decoded;
  return decoded.substring(0, maxLength) + "...";
};

export function RebuttalIndicator({ rebuttalTo }: RebuttalIndicatorProps) {
  if (!rebuttalTo) return null;

  const scrollToArgument = () => {
    const targetArgument = document.getElementById(`argument-${rebuttalTo.id}`);
    if (targetArgument) {
      targetArgument.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add a temporary highlight effect
      targetArgument.classList.add("bg-yellow-50", "dark:bg-yellow-900/20");
      setTimeout(() => {
        targetArgument.classList.remove(
          "bg-yellow-50",
          "dark:bg-yellow-900/20",
        );
      }, 2000);
    }
  };

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <Reply className="w-4 h-4" />
          <span className="text-sm font-medium">
            Rebutting{" "}
            {rebuttalTo.participant.user.name ||
              rebuttalTo.participant.user.email}
            's argument from Turn {rebuttalTo.turnNumber}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={scrollToArgument}
          className="h-7 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          View original
          <ArrowUpRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {rebuttalTo.content && (
        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-muted-foreground">
          <p className="line-clamp-2 italic">
            "{getPlainTextPreview(rebuttalTo.content)}"
          </p>
        </div>
      )}
    </div>
  );
}
