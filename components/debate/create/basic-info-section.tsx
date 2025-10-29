// components/debates/create/basic-info-section.tsx

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DebateFormData } from "@/types/debate";
import {
  ALL_DEBATE_TOPICS,
  type DebateTopic,
  getTopicDisplayName,
} from "@/types/debate";

interface BasicInfoSectionProps {
  formData: DebateFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<DebateFormData>) => void;
  onClearError: (field: string) => void;
}

export function BasicInfoSection({
  formData,
  errors,
  onUpdate,
  onClearError,
}: BasicInfoSectionProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    onUpdate({
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
    onClearError(name);
  };

  const handleAddTopic = (topic: DebateTopic) => {
    if (!formData.topics.includes(topic)) {
      onUpdate({
        topics: [...formData.topics, topic],
      });
    }
    onClearError("topics");
  };

  const handleRemoveTopic = (topicToRemove: DebateTopic) => {
    onUpdate({
      topics: formData.topics.filter((topic) => topic !== topicToRemove),
    });
  };

  // Available topics that haven't been selected yet
  const availableTopics = ALL_DEBATE_TOPICS.filter(
    (topic) => !formData.topics.includes(topic),
  );

  return (
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
          className="w-full" // Ensure full width
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Topics <span className="text-destructive">*</span>
        </Label>

        {/* Selected Topics Display */}
        {formData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="px-3 py-1">
                {getTopicDisplayName(topic)}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Topic Selector - Make it full width */}
        <Select onValueChange={handleAddTopic} value="">
          <SelectTrigger className="w-full">
            {" "}
            {/* Add w-full here */}
            <SelectValue placeholder="Add a topic category" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {" "}
            {/* Ensure content matches width */}
            {availableTopics.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                All topics selected
              </div>
            ) : (
              availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {getTopicDisplayName(topic)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {errors.topics && (
          <p className="text-sm text-destructive">{errors.topics}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Choose one or more relevant topic categories (max 3 recommended)
        </p>
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
          className="w-full" // Ensure full width
        />
      </div>
    </div>
  );
}
