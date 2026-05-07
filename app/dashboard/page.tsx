"use client";

import { Info, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (!session) router.push("/auth/signin");
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">
                {t("dashboard.welcome", {
                  name: session.user.name || session.user.email,
                })}
              </CardTitle>
            </div>
            <CardDescription>{t("dashboard.protectedPage")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {session.user.name
                  ? t("dashboard.nameProvided")
                  : t("dashboard.emailOnly")}
              </Badge>
              <Badge variant="outline">{session.user.email}</Badge>
              {session.user.image && (
                <Badge variant="outline">
                  {t("dashboard.hasProfileImage")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t("dashboard.sessionInfo")}</AlertTitle>
          <AlertDescription>
            <pre className="text-sm mt-2 overflow-auto bg-muted/50 p-4 rounded-md w-full">
              {JSON.stringify(session, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>

        {/* Additional dashboard cards can go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                {t("dashboard.authStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.authStatusDesc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {t("dashboard.accountDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("dashboard.name")}
                </span>
                <span className="font-medium">
                  {session.user.name || t("dashboard.notProvided")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("dashboard.email")}
                </span>
                <span className="font-medium">{session.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("dashboard.sessionExpires")}
                </span>
                <span className="font-medium">
                  {session.expires
                    ? new Date(session.expires).toLocaleDateString()
                    : t("dashboard.unknown")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
