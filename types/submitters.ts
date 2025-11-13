import type { Reference } from "./reference";

export interface BaseItem {
  id: number;
  references: Reference[];
}

export interface AccordionItemConfig {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  disabledMessage?: string;
  emptyMessage?: {
    title: string;
    description: string;
    icon?: React.ComponentType<any>;
  };
}

export interface ItemManagerProps<T extends BaseItem> {
  items: T[];
  error?: string;
  onItemsChange: (items: T[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  maxItems?: number;
  minItems?: number;
  title?: string;
  description?: string;
  showStatusIndicators?: boolean;
  config?: AccordionItemConfig;
}
