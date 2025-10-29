// components/debates/create/basic-info-section.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DebateFormData } from "@/types/debate";

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
  );
}
