"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SortableListProps {
  /** Stable string IDs for each item — must match `id` props on SortableCard children */
  ids: string[];
  /** Called with (fromIndex, toIndex) after a drag completes */
  onReorder: (from: number, to: number) => void;
  children: React.ReactNode;
}

/**
 * Wrap a list of <SortableCard> items with this component to enable drag-to-reorder.
 * Usage:
 *   <SortableList ids={items.map((_,i) => `prefix-${i}`)} onReorder={(f,t) => setItems(prev => arrayMove(prev, f, t))}>
 *     {items.map((item, idx) => <SortableCard key={`prefix-${idx}`} id={`prefix-${idx}`} ...>...</SortableCard>)}
 *   </SortableList>
 */
export function SortableList({ ids, onReorder, children }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from !== -1 && to !== -1) onReorder(from, to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{children}</div>
      </SortableContext>
    </DndContext>
  );
}
