"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Plus, X, Footprints, Bus } from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type {
  TransferItem,
  TransferType,
  ExtractedTripData,
} from "@/lib/types/trip-sections";
import { emptyTransfer } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard } from "./use-trip-form";

const TRANSFER_TYPE_OPTIONS: {
  value: TransferType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "transfer", label: "Трансфер", icon: Bus },
  { value: "rental", label: "Аренда авто", icon: Car },
  { value: "walking", label: "Пешком", icon: Footprints },
];

function typeLabel(t: TransferType) {
  return TRANSFER_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? "Трансфер";
}

function TypeIcon({ type }: { type: TransferType }) {
  const Comp =
    TRANSFER_TYPE_OPTIONS.find((o) => o.value === type)?.icon ?? Bus;
  return <Comp className="h-4 w-4" />;
}

interface TransferSectionProps {
  transfers: TransferItem[];
  setTransfers: React.Dispatch<React.SetStateAction<TransferItem[]>>;
}

export function TransferSection({
  transfers,
  setTransfers,
}: TransferSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Транспорт</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="transfer"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).transfers;
              if (arr?.length) setTransfers((prev) => [...prev, ...arr]);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setTransfers((prev) => [...prev, { ...emptyTransfer }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {transfers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Car className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет транспорта. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transfers.map((transfer, idx) => {
            const tType = (transfer.type ?? "transfer") as TransferType;
            return (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TypeIcon type={tType} />
                      {typeLabel(tType)} {idx + 1}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <AiFillDialog
                        category="transfer"
                        compact
                        onExtracted={(d) =>
                          applyToCard(setTransfers, idx, "transfers", d)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setTransfers((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {/* Type selector */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Тип транспорта</Label>
                    <Select
                      value={tType}
                      onValueChange={(v) =>
                        v && updateItem(setTransfers, idx, "type", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSFER_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ─── Common fields ─── */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Описание</Label>
                    <Textarea
                      placeholder="Описание перемещения"
                      value={transfer.transferInfo}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "transferInfo",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Откуда</Label>
                    <Input
                      placeholder="Аэропорт, вокзал, адрес..."
                      value={transfer.fromLocation ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "fromLocation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Куда</Label>
                    <Input
                      placeholder="Отель, вокзал, адрес..."
                      value={transfer.toLocation ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "toLocation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input
                      type="date"
                      value={transfer.date ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "date",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Время</Label>
                    <Input
                      type="time"
                      value={transfer.time ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "time",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Цена</Label>
                    <Input
                      placeholder="50.00 EUR"
                      value={transfer.price ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "price",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>№ подтверждения</Label>
                    <Input
                      placeholder="ABC123"
                      value={transfer.confirmationNumber ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "confirmationNumber",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* ─── Transfer-specific ─── */}
                  {tType === "transfer" && (
                    <>
                      <Separator className="sm:col-span-2" />
                      <div className="space-y-2">
                        <Label>Телефон водителя</Label>
                        <Input
                          placeholder="+90 532 987 65 43"
                          value={transfer.transferDriverPhone}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "transferDriverPhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Место встречи</Label>
                        <Input
                          placeholder="Выход B, табличка с именем"
                          value={transfer.transferMeetingPoint}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "transferMeetingPoint",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* ─── Rental-specific ─── */}
                  {tType === "rental" && (
                    <>
                      <Separator className="sm:col-span-2" />
                      <div className="space-y-2">
                        <Label>Прокатная компания</Label>
                        <Input
                          placeholder="Europcar, Sixt..."
                          value={transfer.rentalCompany ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "rentalCompany",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Модель авто</Label>
                        <Input
                          placeholder="VW Golf или аналог"
                          value={transfer.carModel ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "carModel",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Место получения</Label>
                        <Input
                          placeholder="Аэропорт VCE, офис Europcar"
                          value={transfer.pickupLocation ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "pickupLocation",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Место возврата</Label>
                        <Input
                          placeholder="Аэропорт VCE"
                          value={transfer.dropoffLocation ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "dropoffLocation",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата получения</Label>
                        <Input
                          type="date"
                          value={transfer.pickupDate ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "pickupDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Время получения</Label>
                        <Input
                          type="time"
                          value={transfer.pickupTime ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "pickupTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата возврата</Label>
                        <Input
                          type="date"
                          value={transfer.dropoffDate ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "dropoffDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Время возврата</Label>
                        <Input
                          type="time"
                          value={transfer.dropoffTime ?? ""}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "dropoffTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      {/* Rental insurance sub-section */}
                      <Separator className="sm:col-span-2" />
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                          Страховка аренды
                        </h4>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Тип страховки</Label>
                            <Input
                              placeholder="CDW, SCDW, Full Protection..."
                              value={transfer.rentalInsuranceType ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  setTransfers,
                                  idx,
                                  "rentalInsuranceType",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Телефон страховой</Label>
                            <Input
                              placeholder="+39 02 1234567"
                              value={transfer.rentalInsurancePhone ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  setTransfers,
                                  idx,
                                  "rentalInsurancePhone",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Детали страховки</Label>
                            <Textarea
                              rows={2}
                              placeholder="Покрытие, франшиза, условия..."
                              value={transfer.rentalInsuranceInfo ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  setTransfers,
                                  idx,
                                  "rentalInsuranceInfo",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── Walking — just notes ─── */}
                  {tType === "walking" && (
                    <>
                      <Separator className="sm:col-span-2" />
                      <p className="text-xs text-muted-foreground sm:col-span-2">
                        Используйте общие поля выше для описания пешего
                        маршрута.
                      </p>
                    </>
                  )}

                  {/* Notes — common for all types */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Заметки</Label>
                    <Textarea
                      rows={2}
                      placeholder="Дополнительная информация..."
                      value={transfer.notes ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setTransfers,
                          idx,
                          "notes",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
