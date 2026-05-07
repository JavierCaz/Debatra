"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  image: z.url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    bio: string | null;
    image: string | null;
  };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      image: user.image || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("editProfile.failedToUpdate"));
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("editProfile.anErrorOccurred"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("editProfile.editProfile")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("editProfile.editProfileTitle")}</DialogTitle>
          <DialogDescription>
            {t("editProfile.editProfileDesc")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
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
                {t("editProfile.success")}
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">{t("editProfile.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  {t("editProfile.emailCannotBeChanged")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t("editProfile.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  placeholder="Your name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("editProfile.bio")}</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder={t("editProfile.bioPlaceholder")}
                  className={errors.bio ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t("editProfile.bioMaxLength")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">
                  {t("editProfile.profileImageUrl")}
                </Label>
                <Input
                  id="image"
                  type="url"
                  {...register("image")}
                  placeholder={t("editProfile.imagePlaceholder")}
                  className={errors.image ? "border-destructive" : ""}
                />
                {errors.image && (
                  <p className="text-sm text-destructive">
                    {errors.image.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t("editProfile.imageDescription")}
                </p>
              </div>
            </>
          )}
        </form>

        {!success && (
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("editProfile.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="edit-profile-form"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("editProfile.saving")
                : t("editProfile.saveChanges")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
