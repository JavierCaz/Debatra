import { Trash2 } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { StatusIndicators } from "./status-indicators";

interface AccordionItemWrapperProps {
  id: number;
  title: string;
  preview?: string;
  isExpanded: boolean;
  showStatusIndicators: boolean;
  hasContent: boolean;
  hasReferences: boolean;
  referencesCount?: number;
  canDelete: boolean;
  onDelete: (id: number) => void;
  children: React.ReactNode;
}

export function AccordionItemWrapper({
  id,
  title,
  preview,
  isExpanded,
  showStatusIndicators,
  hasContent,
  hasReferences,
  referencesCount = 0,
  canDelete,
  onDelete,
  children,
}: AccordionItemWrapperProps) {
  return (
    <AccordionItem
      value={id.toString()}
      className="border border-border rounded-lg bg-background"
    >
      <div className="relative">
        <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
          <div className="flex items-center justify-between w-full pr-8">
            <div className="flex items-center gap-3 text-left">
              <span className="text-base font-semibold">{title}</span>
              {showStatusIndicators && (
                <StatusIndicators
                  hasContent={hasContent}
                  hasReferences={hasReferences}
                />
              )}
            </div>
          </div>
        </AccordionTrigger>

        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isExpanded && preview && (
        <div className="px-6 py-2">
          <p className="text-sm text-muted-foreground">{preview}</p>
          {hasReferences && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {referencesCount} reference(s)
            </p>
          )}
        </div>
      )}

      <AccordionContent className="px-0">
        <div className="px-6 pb-6 space-y-6 border-t pt-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
