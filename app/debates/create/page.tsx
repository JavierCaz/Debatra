"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateDebateForm } from "@/components/debate/create/create-debate-form";
import type { DebateFormData, InitialArgument } from "@/types/debate";

export default function CreateDebatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    formData: DebateFormData,
    initialArguments: InitialArgument[],
    status: string,
  ) => {
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        initialArguments,
        status,
      };

      const response = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to create debate");
      }

      const debate = await response.json();
      router.push(`/debates/${debate.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create debate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <CreateDebateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
