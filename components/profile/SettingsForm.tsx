"use client";

import { AlertCircle, CheckCircle, Settings } from "lucide-react";
import { useState } from "react";
import { updateNotificationPreferences } from "@/app/actions/notifications";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface SettingsFormProps {
  initialPreferences: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
}

export function SettingsForm({ initialPreferences }: SettingsFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (
    key: keyof typeof preferences,
    value: boolean,
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setHasChanges(true);
    setSuccess(false);
    setError(null);
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateNotificationPreferences(preferences);

      if (result.success) {
        setSuccess(true);
        setHasChanges(false);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || "Failed to update preferences");
      }
    } catch (err) {
      setError("An error occurred while updating preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!success) {
      setPreferences(initialPreferences);
      setHasChanges(false);
    }
    setError(null);
    setSuccess(false);
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
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Control how you receive notifications from Debate Platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                Preferences updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <>
              {/* In-App Notifications */}
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5 flex-1">
                  <Label
                    htmlFor="in-app-notifications"
                    className="text-base font-medium"
                  >
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notification badges and alerts within the app
                  </p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={preferences.inApp}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("inApp", checked)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <Separator />

              {/* Email Notifications */}
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5 flex-1">
                  <Label
                    htmlFor="email-notifications"
                    className="text-base font-medium"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for debate updates and responses
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("email", checked)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <Separator />

              {/* Push Notifications (Future) */}
              <div className="flex items-center justify-between space-x-4 opacity-60">
                <div className="space-y-0.5 flex-1">
                  <Label
                    htmlFor="push-notifications"
                    className="text-base font-medium"
                  >
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications (coming soon)
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.push}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("push", checked)
                  }
                  disabled={true}
                />
              </div>

              {/* Help Text */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Critical account-related emails will
                  always be sent regardless of these settings.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!success ? (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
