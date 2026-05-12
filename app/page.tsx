"use client";

import {
  BookCheck,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Trophy,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("home.step1Title"),
      description: t("home.step1Desc"),
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      number: "02",
      title: t("home.step2Title"),
      description: t("home.step2Desc"),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      number: "03",
      title: t("home.step3Title"),
      description: t("home.step3Desc"),
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      number: "04",
      title: t("home.step4Title"),
      description: t("home.step4Desc"),
      icon: Vote,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-950",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {t("home.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center space-y-1">
            <BookCheck className="h-5 w-5 text-blue-500/70" />
            <div className="text-sm font-medium text-foreground/80">
              {t("home.evidenceBased")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("home.evidenceBasedDesc")}
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <Clock className="h-5 w-5 text-green-500/70" />
            <div className="text-sm font-medium text-foreground/80">
              {t("home.turnBased")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("home.turnBasedDesc")}
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <Trophy className="h-5 w-5 text-amber-500/70" />
            <div className="text-sm font-medium text-foreground/80">
              {t("home.clearOutcomes")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("home.clearOutcomesDesc")}
            </p>
          </div>
        </div>

        <div className="mt-18">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t("home.howItWorks")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.howItWorksDesc")}
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-amber-200 -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {steps.map((step, idx) => (
                <div key={step.title} className="relative">
                  <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className={`flex justify-center mb-4`}>
                        <div className={`${step.bgColor} p-3 rounded-full`}>
                          <step.icon className={`h-8 w-8 ${step.color}`} />
                        </div>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground mb-2">
                        {"Step "}
                        {step.number}
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>

                  {idx < steps.length - 1 && (
                    <div className="md:hidden flex justify-center">
                      <div className="text-muted-foreground">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="default">
              <Link href={session ? "/debates" : "/auth/signup"}>
                {session ? t("home.startDebating") : t("home.joinCommunity")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
