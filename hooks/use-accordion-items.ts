import { useState } from "react";
import type { BaseItem } from "@/types/submitters";

export function useAccordionItems<T extends BaseItem>(
  initialItems: T[],
  onItemsChange: (items: T[]) => void,
) {
  const [expandedItems, setExpandedItems] = useState<string[]>(
    initialItems.map((item) => item.id.toString()),
  );

  const addItem = (newItem: T) => {
    onItemsChange([...initialItems, newItem]);
    setExpandedItems((prev) => [...prev, newItem.id.toString()]);
  };

  const removeItem = (id: number) => {
    onItemsChange(initialItems.filter((item) => item.id !== id));
    setExpandedItems((prev) =>
      prev.filter((itemId) => itemId !== id.toString()),
    );
  };

  const updateItem = (id: number, updates: Partial<T>) => {
    onItemsChange(
      initialItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  const expandAll = () => {
    setExpandedItems(initialItems.map((item) => item.id.toString()));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const isExpanded = (id: number) => expandedItems.includes(id.toString());

  return {
    expandedItems,
    setExpandedItems,
    addItem,
    removeItem,
    updateItem,
    expandAll,
    collapseAll,
    isExpanded,
  };
}
