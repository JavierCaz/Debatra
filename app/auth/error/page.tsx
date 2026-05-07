"use client";

import { AlertCircle, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AuthErrorContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: t("authError.Configuration"),
    AccessDenied: t("authError.AccessDenied"),
    Verification: t("authError.Verification"),
    OAuthSignin: t("authError.OAuthSignin"),
    OAuthCallback: t("authError.OAuthCallback"),
    OAuthCreateAccount: t("authError.OAuthCreateAccount"),
    EmailCreateAccount: t("authError.EmailCreateAccount"),
    Callback: t("authError.Callback"),
    OAuthAccountNotLinked: t("authError.OAuthAccountNotLinked"),
    EmailSignin: t("authError.EmailSignin"),
    CredentialsSignin: t("authError.CredentialsSignin"),
    SessionRequired: t("authError.SessionRequired"),
    default: t("authError.default"),
  };

  const errorMessage = error
    ? errorMessages[error] || errorMessages.default
    : errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{t("authError.title")}</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && t("authError.errorCode", { code: error })}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                {t("authError.backToSignIn")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("authError.goHome")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  {t("common.loading")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
