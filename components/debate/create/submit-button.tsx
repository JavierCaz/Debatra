// components/debates/create/submit-buttons.tsx
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonsProps {
  isSubmitting: boolean;
  onSubmit: (status: string) => void;
}

export function SubmitButtons({ isSubmitting, onSubmit }: SubmitButtonsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={() => onSubmit("DRAFT")}
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save as Draft
      </Button>
      <Button
        type="button"
        onClick={() => onSubmit("OPEN")}
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Create Debate
      </Button>
    </div>
  );
}
