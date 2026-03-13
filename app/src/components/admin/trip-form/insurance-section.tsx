"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, X } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type {
  InsuranceItem,
  ExtractedTripData,
} from "@/lib/types/trip-sections";
import { emptyInsurance } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard } from "./use-trip-form";
import { SortableList } from "./sortable-list";
import { SortableCard } from "./sortable-card";

interface InsuranceSectionProps {
  insurances: InsuranceItem[];
  setInsurances: React.Dispatch<React.SetStateAction<InsuranceItem[]>>;
}

export function InsuranceSection({
  insurances,
  setInsurances,
}: InsuranceSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Страховки</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="insurance"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).insurances;
              if (arr?.length) setInsurances((prev) => [...prev, ...arr]);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setInsurances((prev) => [...prev, { ...emptyInsurance }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {insurances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет страховок. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SortableList
          ids={insurances.map((_, i) => `ins-${i}`)}
          onReorder={(from, to) => setInsurances((prev) => arrayMove(prev, from, to))}
        >
          {insurances.map((ins, idx) => (
            <SortableCard
              key={`ins-${idx}`}
              id={`ins-${idx}`}
              title={`Страховка ${idx + 1}`}
              subtitle={[ins.insuranceInfo.slice(0, 50), ins.insurancePhone].filter(Boolean).join(" · ") || undefined}
              contentClassName="grid gap-4 grid-cols-1 sm:grid-cols-2"
              actions={
                <>
                  <AiFillDialog
                    category="insurance"
                    compact
                    onExtracted={(d) => applyToCard(setInsurances, idx, "insurances", d)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setInsurances((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              }
            >
                <div className="space-y-2 sm:col-span-2">
                  <Label>Информация о страховке</Label>
                  <Textarea
                    placeholder="Полис #12345, покрытие до $50,000"
                    value={ins.insuranceInfo}
                    onChange={(e) =>
                      updateItem(
                        setInsurances,
                        idx,
                        "insuranceInfo",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон страховой</Label>
                  <Input
                    placeholder="+7 800 123 45 67"
                    value={ins.insurancePhone}
                    onChange={(e) =>
                      updateItem(
                        setInsurances,
                        idx,
                        "insurancePhone",
                        e.target.value,
                      )
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
