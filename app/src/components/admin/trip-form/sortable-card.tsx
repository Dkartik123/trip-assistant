"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";

interface SortableCardProps {
  id: string;
  title: React.ReactNode;
  /** Buttons rendered at the right side of the header (AI fill, delete, etc.) */
  actions?: React.ReactNode;
  /** Additional className for the CardContent wrapper */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * A draggable, collapsible Card used inside <SortableList>.
 * The drag handle (⠿) lets users reorder cards.
 * The collapse chevron hides/shows the card body.
 */
export function SortableCard({
  id,
  title,
  actions,
  contentClassName,
  children,
}: SortableCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label="Перетащить"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <CardTitle className="min-w-0 flex-1 truncate text-base">
              {title}
            </CardTitle>

            <div className="flex shrink-0 items-center gap-1">
              {actions}
              {/* Collapse toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label={collapsed ? "Развернуть" : "Свернуть"}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!collapsed && (
          <CardContent className={contentClassName}>{children}</CardContent>
        )}
      </Card>
    </div>
  );
}
