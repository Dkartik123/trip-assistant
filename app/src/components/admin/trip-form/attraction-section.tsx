"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, X } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type {
  AttractionItem,
  ExtractedTripData,
} from "@/lib/types/trip-sections";
import { emptyAttraction } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard } from "./use-trip-form";
import { SortableList } from "./sortable-list";
import { SortableCard } from "./sortable-card";

function attractionSubtitle(a: AttractionItem): string {
  const date = a.date ? `${a.date.slice(8, 10)}.${a.date.slice(5, 7)}` : "";
  const when = [date, a.time].filter(Boolean).join(" ");
  return [a.name, when].filter(Boolean).join(" · ");
}
function sortAttractions(arr: AttractionItem[]) {
  return [...arr].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

interface AttractionSectionProps {
  attractions: AttractionItem[];
  setAttractions: React.Dispatch<React.SetStateAction<AttractionItem[]>>;
}

export function AttractionSection({
  attractions,
  setAttractions,
}: AttractionSectionProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAttractions((prev) => sortAttractions(prev));
  }, []);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Развлечения</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="attraction"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).attractions;
              if (arr?.length)
                setAttractions((prev) => sortAttractions([...prev, ...arr]));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setAttractions((prev) => [...prev, { ...emptyAttraction }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {attractions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет развлечений. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SortableList
          ids={attractions.map((_, i) => `attr-${i}`)}
          onReorder={(from, to) =>
            setAttractions((prev) => arrayMove(prev, from, to))
          }
        >
          {attractions.map((attr, idx) => (
            <SortableCard
              key={`attr-${idx}`}
              id={`attr-${idx}`}
              title={`Развлечение ${idx + 1}`}
              subtitle={attractionSubtitle(attr) || undefined}
              contentClassName="grid gap-4 grid-cols-1 sm:grid-cols-2"
              actions={
                <>
                  <AiFillDialog
                    category="attraction"
                    compact
                    onExtracted={(d) =>
                      applyToCard(setAttractions, idx, "attractions", d)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setAttractions((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              }
            >
              <div className="space-y-2 sm:col-span-2">
                <Label>Название</Label>
                <Input
                  placeholder="Экскурсия по городу"
                  value={attr.name}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Описание</Label>
                <Textarea
                  rows={2}
                  placeholder="Описание мероприятия..."
                  value={attr.description}
                  onChange={(e) =>
                    updateItem(
                      setAttractions,
                      idx,
                      "description",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={attr.date}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "date", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Время</Label>
                <Input
                  placeholder="10:00"
                  value={attr.time}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "time", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Место</Label>
                <Input
                  placeholder="Старый город"
                  value={attr.location}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "location", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  placeholder="25.00 EUR"
                  value={attr.price}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "price", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>№ подтверждения</Label>
                <Input
                  placeholder="CONF-123"
                  value={attr.confirmationNumber}
                  onChange={(e) =>
                    updateItem(
                      setAttractions,
                      idx,
                      "confirmationNumber",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Заметки</Label>
                <Textarea
                  rows={2}
                  placeholder="Дополнительная информация..."
                  value={attr.notes}
                  onChange={(e) =>
                    updateItem(setAttractions, idx, "notes", e.target.value)
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
