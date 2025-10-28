// components/debates/create/references-section.tsx
"use client";

import { Link, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Reference } from "@/types/debate";

interface ReferencesSectionProps {
  references: Reference[];
  onReferencesChange: (references: Reference[]) => void;
}

export function ReferencesSection({
  references,
  onReferencesChange,
}: ReferencesSectionProps) {
  const [newReference, setNewReference] = useState({ title: "", url: "" });
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addReference = () => {
    const newErrors: { title?: string; url?: string } = {};

    if (!newReference.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!newReference.url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(newReference.url)) {
      newErrors.url = "Please enter a valid URL (include http:// or https://)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onReferencesChange([...references, { ...newReference, id: Date.now() }]);
    setNewReference({ title: "", url: "" });
  };

  const handleReferenceChange = (field: "title" | "url", value: string) => {
    setNewReference((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const removeReference = (id: number) => {
    onReferencesChange(references.filter((ref) => ref.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium mb-2">References & Sources</h4>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Input
                value={newReference.title}
                onChange={(e) => handleReferenceChange("title", e.target.value)}
                placeholder="Reference title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newReference.url}
                  onChange={(e) => handleReferenceChange("url", e.target.value)}
                  placeholder="https://example.com"
                  className={`flex-1 ${errors.url ? "border-destructive" : ""}`}
                />
                <Button type="button" onClick={addReference} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.url ? (
                <p className="text-sm text-destructive">{errors.url}</p>
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
  );
}
