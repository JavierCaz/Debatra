"use client";

import { Reply } from "lucide-react";
import type { DebateWithDetails } from "@/types/debate";

interface ResponseIndicatorProps {
  responseTo: DebateWithDetails["participants"][0]["arguments"][0]["responseTo"];
  responseType?: "rebuttal" | "support";
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
  return `${decoded.substring(0, maxLength)}...`;
};

export function ResponseIndicator({
  responseTo,
  responseType = "rebuttal",
}: ResponseIndicatorProps) {
  if (!responseTo) return null;

  // Determine styling and text based on response type
  const isSupport = responseType === "support";
  const bgColor = isSupport ? "bg-green-50" : "bg-blue-50";
  const darkBgColor = isSupport
    ? "dark:bg-green-950/30"
    : "dark:bg-blue-950/30";
  const borderColor = isSupport ? "border-green-200" : "border-blue-200";
  const darkBorderColor = isSupport
    ? "dark:border-green-800"
    : "dark:border-blue-800";
  const textColor = isSupport ? "text-green-700" : "text-blue-700";
  const darkTextColor = isSupport
    ? "dark:text-green-300"
    : "dark:text-blue-300";

  const actionText = isSupport ? "Adding to" : "Rebutting to";
  const icon = isSupport ? (
    <Reply className="w-4 h-4 transform rotate-180" />
  ) : (
    <Reply className="w-4 h-4" />
  );

  return (
    <div
      className={`mb-3 p-3 ${bgColor} ${darkBgColor} border ${borderColor} ${darkBorderColor} rounded-lg`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center space-x-2 ${textColor} ${darkTextColor}`}
        >
          {icon}
          <span className="text-sm font-medium">
            {actionText}{" "}
            {responseTo.participant.user.name ||
              responseTo.participant.user.email}
            's argument from Turn {responseTo.turnNumber}
          </span>
        </div>
      </div>

      {responseTo.content && (
        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-muted-foreground">
          <p className="line-clamp-2 italic">
            "{getPlainTextPreview(responseTo.content)}"
          </p>
        </div>
      )}
    </div>
  );
}
