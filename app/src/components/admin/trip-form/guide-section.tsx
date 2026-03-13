"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Plus, X } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type { GuideItem, ExtractedTripData } from "@/lib/types/trip-sections";
import { emptyGuide } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard } from "./use-trip-form";
import { SortableList } from "./sortable-list";
import { SortableCard } from "./sortable-card";

interface GuideSectionProps {
  guides: GuideItem[];
  setGuides: React.Dispatch<React.SetStateAction<GuideItem[]>>;
}

export function GuideSection({ guides, setGuides }: GuideSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Гиды</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="guide"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).guides;
              if (arr?.length) setGuides((prev) => [...prev, ...arr]);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setGuides((prev) => [...prev, { ...emptyGuide }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {guides.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <UserCheck className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет гидов. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SortableList
          ids={guides.map((_, i) => `guide-${i}`)}
          onReorder={(from, to) => setGuides((prev) => arrayMove(prev, from, to))}
        >
          {guides.map((guide, idx) => (
            <SortableCard
              key={`guide-${idx}`}
              id={`guide-${idx}`}
              title={`Гид ${idx + 1}`}
              contentClassName="grid gap-4 grid-cols-1 sm:grid-cols-2"
              actions={
                <>
                  <AiFillDialog
                    category="guide"
                    compact
                    onExtracted={(d) => applyToCard(setGuides, idx, "guides", d)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setGuides((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              }
            >
                <div className="space-y-2">
                  <Label>Имя гида</Label>
                  <Input
                    placeholder="Мехмет Йылмаз"
                    value={guide.guideName}
                    onChange={(e) =>
                      updateItem(setGuides, idx, "guideName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон гида</Label>
                  <Input
                    placeholder="+90 532 123 45 67"
                    value={guide.guidePhone}
                    onChange={(e) =>
                      updateItem(setGuides, idx, "guidePhone", e.target.value)
                    }
                  />
                </div>
            </SortableCard>
          ))}
        </SortableList>
      )}
    </div>
  );
}
