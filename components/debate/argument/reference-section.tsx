"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Reference } from "@/types/debate";

interface ReferencesSectionProps {
  references: Reference[];
  onReferencesChange: (references: Reference[]) => void;
  disabled?: boolean;
  minReferences?: number;
}

export function ReferencesSection({
  references,
  onReferencesChange,
  disabled = false,
  minReferences = 0,
}: ReferencesSectionProps) {
  const addReference = () => {
    const newReference: Reference = {
      id: Date.now(),
      title: "",
      url: "",
    };
    onReferencesChange([...references, newReference]);
  };

  const removeReference = (id: number) => {
    if (references.length > minReferences) {
      onReferencesChange(references.filter((ref) => ref.id !== id));
    }
  };

  const updateReference = (id: number, updates: Partial<Reference>) => {
    onReferencesChange(
      references.map((ref) => (ref.id === id ? { ...ref, ...updates } : ref)),
    );
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">References</h4>
          <p className="text-xs text-muted-foreground">
            Add supporting references for your argument
          </p>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReference}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {references.map((reference, index) => (
          <Card key={reference.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Reference {index + 1}</CardTitle>
                {!disabled && references.length > minReferences && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReference(reference.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`ref-title-${reference.id}`}>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`ref-title-${reference.id}`}
                  value={reference.title}
                  onChange={(e) =>
                    updateReference(reference.id, { title: e.target.value })
                  }
                  placeholder="Enter reference title"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ref-url-${reference.id}`}>URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id={`ref-url-${reference.id}`}
                    type="url"
                    value={reference.url}
                    onChange={(e) =>
                      updateReference(reference.id, { url: e.target.value })
                    }
                    placeholder="https://example.com"
                    disabled={disabled}
                    className="flex-1"
                  />
                  {reference.url && validateUrl(reference.url) && (
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {reference.url && !validateUrl(reference.url) && (
                  <p className="text-xs text-destructive">
                    Please enter a valid URL
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Provide a link to the source (optional but recommended)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {references.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No references added yet</p>
              <p className="text-xs mt-1">
                Add supporting references to strengthen your argument
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
