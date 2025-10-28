"use client";

import { FileText, Link, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface Reference {
  id: number;
  title: string;
  url: string;
}

interface DebateFormData {
  title: string;
  topic: string;
  description: string;
  format: "ONE_VS_ONE" | "ONE_VS_MANY" | "MULTI_SIDED";
  maxParticipants: number;
  turnsPerSide: number;
  turnTimeLimit: number;
  minReferences: number;
}

export default function CreateDebatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DebateFormData>({
    title: "",
    topic: "",
    description: "",
    format: "ONE_VS_ONE",
    maxParticipants: 2,
    turnsPerSide: 3,
    turnTimeLimit: 24,
    minReferences: 1,
  });

  const [openingStatement, setOpeningStatement] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [newReference, setNewReference] = useState({ title: "", url: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceErrors, setReferenceErrors] = useState<{
    title?: string;
    url?: string;
  }>({});

  const debateFormats = [
    {
      value: "ONE_VS_ONE" as const,
      label: "One vs One",
      description: "Two participants",
    },
    {
      value: "ONE_VS_MANY" as const,
      label: "One vs Many",
      description: "One person vs multiple",
    },
    {
      value: "MULTI_SIDED" as const,
      label: "Multi-sided",
      description: "Multiple positions",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Enhanced addReference function
  const addReference = () => {
    const newErrors: { title?: string; url?: string } = {};

    // Validate title
    if (!newReference.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Validate URL
    if (!newReference.url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(newReference.url)) {
      newErrors.url = "Please enter a valid URL (include http:// or https://)";
    }

    // If there are errors, set them and return without adding
    if (Object.keys(newErrors).length > 0) {
      setReferenceErrors(newErrors);
      return;
    }

    // Clear errors and add reference
    setReferenceErrors({});
    setReferences([...references, { ...newReference, id: Date.now() }]);
    setNewReference({ title: "", url: "" });
  };

  // Clear reference errors when user types
  const handleReferenceChange = (field: "title" | "url", value: string) => {
    setNewReference((prev) => ({ ...prev, [field]: value }));
    if (referenceErrors[field]) {
      setReferenceErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const removeReference = (id: number) => {
    setReferences(references.filter((ref) => ref.id !== id));
  };

  const handleSubmit = async (status: string) => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.topic) newErrors.topic = "Topic is required";

    const plainText = openingStatement.replace(/<[^>]*>/g, "").trim();
    if (!plainText || plainText.length < 10) {
      newErrors.openingStatement =
        "Opening statement is required (minimum 10 characters)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        openingStatement,
        references,
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
      <Card>
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8" />
            <div>
              <CardTitle className="text-3xl">Create New Debate</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Set up your debate parameters and opening position
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Debate Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a clear, descriptive title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic/Resolution <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="The main proposition or question to debate"
              />
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Provide context and background for this debate"
              />
            </div>
          </div>

          {/* Opening Statement */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Opening Statement</h3>
            </div>

            <div className="space-y-2">
              <Label>
                Your Opening Position{" "}
                <span className="text-destructive">*</span>
              </Label>
              <TiptapEditor
                content={openingStatement}
                onChange={setOpeningStatement}
                placeholder="Present your initial argument, evidence, and reasoning..."
              />
              {errors.openingStatement && (
                <p className="text-sm text-destructive">
                  {errors.openingStatement}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Provide a well-reasoned opening argument with supporting
                evidence
              </p>
            </div>
          </div>

          {/* References */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                References & Sources
              </h3>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      value={newReference.title}
                      onChange={(e) =>
                        handleReferenceChange("title", e.target.value)
                      }
                      placeholder="Reference title"
                      className={
                        referenceErrors.title ? "border-destructive" : ""
                      }
                    />
                    {referenceErrors.title && (
                      <p className="text-sm text-destructive">
                        {referenceErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={newReference.url}
                        onChange={(e) =>
                          handleReferenceChange("url", e.target.value)
                        }
                        placeholder="https://example.com"
                        className={`flex-1 ${referenceErrors.url ? "border-destructive" : ""}`}
                      />
                      <Button type="button" onClick={addReference} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {referenceErrors.url ? (
                      <p className="text-sm text-destructive">
                        {referenceErrors.url}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Include http:// or https:// in the URL
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {references.length > 0 && (
              <div className="space-y-2">
                {references.map((ref) => (
                  <Card key={ref.id}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <Link className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ref.title}</p>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {ref.url}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReference(ref.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Debate Parameters */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Debate Parameters</h3>
            </div>

            <div className="space-y-2">
              <Label>Debate Format</Label>
              <RadioGroup
                value={formData.format}
                onValueChange={(value: DebateFormData["format"]) =>
                  setFormData((prev) => ({ ...prev, format: value }))
                }
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {debateFormats.map(
                  (format: {
                    value: DebateFormData["format"];
                    label: string;
                    description: string;
                  }) => (
                    <Label
                      key={format.value}
                      htmlFor={format.value}
                      className="flex flex-col space-y-1 cursor-pointer"
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-colors ${
                          formData.format === format.value
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={format.value}
                              id={format.value}
                            />
                            <div>
                              <p className="font-medium">{format.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {format.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  ),
                )}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="2"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turnsPerSide">Turns Per Side</Label>
                <Input
                  type="number"
                  id="turnsPerSide"
                  name="turnsPerSide"
                  value={formData.turnsPerSide}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turnTimeLimit">
                  Time Limit Per Turn (hours)
                </Label>
                <Input
                  type="number"
                  id="turnTimeLimit"
                  name="turnTimeLimit"
                  value={formData.turnTimeLimit}
                  onChange={handleInputChange}
                  min="1"
                  max="168"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minReferences">
                  Minimum References Required
                </Label>
                <Input
                  type="number"
                  id="minReferences"
                  name="minReferences"
                  value={formData.minReferences}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("OPEN")}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Debate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
