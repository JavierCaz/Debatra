"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function UserNav() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
      setIsSignOutDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="h-9 px-2 text-xs">
          <Link href="/auth/signin">{t("auth.signIn")}</Link>
        </Button>
        <Button asChild size="sm" className="h-9 px-2 text-xs">
          <Link href="/auth/signup">{t("auth.signUp")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Profile button - hidden on mobile, show on desktop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/profile/${user?.id}`)}
        className="hidden sm:flex text-sm font-medium items-center gap-1 h-9 px-2"
      >
        <User className="h-4 w-4" />
        <span className="hidden lg:inline truncate max-w-[100px]">
          {user?.name || user?.email}
        </span>
      </Button>

      {/* Mobile profile icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`/profile/${user?.id}`)}
        className="sm:hidden h-9 w-9"
      >
        <User className="h-4 w-4" />
      </Button>

      <Dialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium flex items-center gap-1 h-9 px-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("auth.signOut")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("auth.confirmSignOut")}</DialogTitle>
            <DialogDescription>
              {t("auth.confirmSignOutMessage")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSignOutDialogOpen(false)}
              disabled={isSigningOut}
            >
              {t("auth.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  {t("auth.signingOut")}
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.signOut")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
