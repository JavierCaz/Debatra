import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DebateFormat, type DebateFormData } from "@/types/debate";

interface DebateParametersSectionProps {
  formData: DebateFormData;
  onUpdate: (updates: Partial<DebateFormData>) => void;
}

interface DebateFormatType {
  value: DebateFormData["format"];
  label: string;
  description: string;
}

export function DebateParametersSection({
  formData,
  onUpdate,
}: DebateParametersSectionProps) {
  const debateFormats: DebateFormatType[] = [
    {
      value: DebateFormat.ONE_VS_ONE,
      label: "One vs One",
      description: "Two participants",
    },
    {
      value: DebateFormat.ONE_VS_MANY,
      label: "One vs Many",
      description: "One person vs multiple",
    },
    {
      value: DebateFormat.MULTI_SIDED,
      label: "Multi-sided",
      description: "Multiple positions",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onUpdate({
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Debate Parameters</h3>
      </div>

      <div className="space-y-2">
        <Label>Debate Format</Label>
        <RadioGroup
          value={formData.format}
          onValueChange={(value: DebateFormData["format"]) =>
            onUpdate({ format: value })
          }
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {debateFormats.map((format) => (
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
                    <RadioGroupItem value={format.value} id={format.value} />
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
          ))}
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
          <Label htmlFor="turnTimeLimit">Time Limit Per Turn (hours)</Label>
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
          <Label htmlFor="minReferences">Minimum References Required</Label>
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
  );
}
