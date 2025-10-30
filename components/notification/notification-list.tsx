"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string | null;
  link: string | null;
  createdAt: Date;
  readAt: Date | null;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  debate: {
    id: string;
    title: string;
    status: string;
  } | null;
};

export function NotificationList({ onUpdate }: { onUpdate?: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const { notifications } = await getNotifications(20);
    setNotifications(notifications as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id);
    await loadNotifications();
    onUpdate?.();
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead();
    await loadNotifications();
    onUpdate?.();
  }

  async function handleDelete(id: string) {
    await deleteNotification(id);
    await loadNotifications();
    onUpdate?.();
  }

  const handleNotificationInteraction = (notification: Notification) => {
    return () => {
      if (notification.status === "UNREAD") {
        handleMarkAsRead(notification.id);
      }
      if (notification.link) {
        router.push(notification.link);
      }
    };
  };

  if (loading) {
    const skeletonItems = Array.from({ length: 5 }, (_, i) => ({
      id: `notification-skeleton-${i}`,
    }));

    return (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {skeletonItems.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          className="text-xs"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {notifications.map((notification) => (
          <div key={notification.id}>
            {/** biome-ignore lint/a11y/useSemanticElements: unavoidable nested buttons */}
            <div
              role="button"
              tabIndex={0}
              onClick={handleNotificationInteraction(notification)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNotificationInteraction(notification)();
                }
              }}
              className="flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors"
            >
              {notification.actor && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.actor.image || undefined} />
                  <AvatarFallback>
                    {notification.actor.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>

                  <div className="flex items-center gap-1">
                    {notification.status === "UNREAD" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        aria-label="Mark notification as read"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      aria-label="Delete notification"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {notification.message && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <Separator />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
