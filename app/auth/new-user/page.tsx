"use client";

import { ArrowRight, CheckCircle, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (!session) router.push("/auth/signin");
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            {t("newUser.welcome")}
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            {t("newUser.accountCreated")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("newUser.getStarted")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {t("newUser.browseDebates")}
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {t("newUser.createDebates")}
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {t("newUser.supportArguments")}
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {t("newUser.engageDiscussions")}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              {t("newUser.goToDashboard")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/debates">
              <Compass className="mr-2 h-4 w-4" />
              {t("newUser.browseDebatesButton")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
