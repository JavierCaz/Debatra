import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccordionItemConfig } from "@/types/submitters";

interface AccordionSectionHeaderProps {
  config: AccordionItemConfig;
  itemsCount: number;
  canAddItem: boolean;
  onAddItem: () => void;
  itemsLabel: string;
  expandAll: () => void;
  collapseAll: () => void;
  expandedItems: string[];
}

export function AccordionSectionHeader({
  config,
  itemsCount,
  canAddItem,
  onAddItem,
  itemsLabel,
  expandAll,
  collapseAll,
  expandedItems,
}: AccordionSectionHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {config.icon && <config.icon className="h-5 w-5 text-primary" />}
            <h3 className="text-lg font-semibold">{config.title}</h3>
          </div>
          {config.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          )}
        </div>

        {canAddItem && (
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add {itemsLabel}
          </Button>
        )}
      </div>

      {itemsCount > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {itemsCount} {itemsLabel}
            {itemsCount !== 1 ? "s" : ""}
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={expandAll}
              disabled={expandedItems.length === itemsCount}
            >
              Expand All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={collapseAll}
              disabled={expandedItems.length === 0}
            >
              Collapse All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
