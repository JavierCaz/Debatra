import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface OpeningStatementSectionProps {
  openingStatement: string;
  error?: string;
  onUpdate: (content: string) => void;
}

export function OpeningStatementSection({
  openingStatement,
  error,
  onUpdate,
}: OpeningStatementSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Opening Statement</h3>
      </div>

      <div className="space-y-2">
        <Label>
          Your Opening Position <span className="text-destructive">*</span>
        </Label>
        <TiptapEditor
          content={openingStatement}
          onChange={onUpdate}
          placeholder="Present your initial argument, evidence, and reasoning..."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Provide a well-reasoned opening argument with supporting evidence
        </p>
      </div>
    </div>
  );
}
