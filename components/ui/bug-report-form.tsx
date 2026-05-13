"use client";

import { AlertCircle, Bug, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitBugReport } from "@/app/actions/bug-report";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BugReportForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPage(window.location.href);
      setBrowserInfo(navigator.userAgent);
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitBugReport({
        title: title.trim(),
        description: description.trim(),
        page,
        browserInfo,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 1500);
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch {
      setError(t("bugReport.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!success) resetForm();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bug className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("bugReport.trigger")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            {t("bugReport.title")}
          </DialogTitle>
          <DialogDescription>
            {t("bugReport.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                {t("bugReport.success")}
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bug-title">{t("bugReport.titleLabel")}</Label>
                <Input
                  id="bug-title"
                  placeholder={t("bugReport.titlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-description">
                  {t("bugReport.descriptionLabel")}
                </Label>
                <Textarea
                  id="bug-description"
                  placeholder={t("bugReport.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={5}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!success ? (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("bugReport.cancel")}
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !description.trim()}
              >
                {isSubmitting ? t("bugReport.submitting") : t("bugReport.submit")}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button type="button">{t("bugReport.close")}</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
