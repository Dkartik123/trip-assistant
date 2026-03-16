"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hotel, Plus, X } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type { HotelItem, ExtractedTripData } from "@/lib/types/trip-sections";
import { emptyHotel } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard } from "./use-trip-form";
import { SortableList } from "./sortable-list";
import { SortableCard } from "./sortable-card";

function hotelSubtitle(h: HotelItem): string {
  const ci = h.checkinDate
    ? `${h.checkinDate.slice(8, 10)}.${h.checkinDate.slice(5, 7)}`
    : "";
  const co = h.checkoutDate
    ? `${h.checkoutDate.slice(8, 10)}.${h.checkoutDate.slice(5, 7)}`
    : "";
  const dates = ci && co ? `${ci} – ${co}` : ci || co;
  return [h.hotelName, dates].filter(Boolean).join(" · ");
}
function sortHotels(arr: HotelItem[]) {
  return [...arr].sort((a, b) => {
    const keyA = `${a.checkinDate ?? ""} ${a.checkinTime ?? ""}`.trim();
    const keyB = `${b.checkinDate ?? ""} ${b.checkinTime ?? ""}`.trim();
    return keyA.localeCompare(keyB);
  });
}

interface HotelSectionProps {
  hotels: HotelItem[];
  setHotels: React.Dispatch<React.SetStateAction<HotelItem[]>>;
}

export function HotelSection({ hotels, setHotels }: HotelSectionProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setHotels((prev) => sortHotels(prev));
  }, []);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Отели</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="hotel"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).hotels;
              if (arr?.length)
                setHotels((prev) => sortHotels([...prev, ...arr]));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setHotels((prev) => [...prev, { ...emptyHotel }])}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {hotels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Hotel className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет отелей. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SortableList
          ids={hotels.map((_, i) => `hotel-${i}`)}
          onReorder={(from, to) =>
            setHotels((prev) => arrayMove(prev, from, to))
          }
        >
          {hotels.map((hotel, idx) => (
            <SortableCard
              key={`hotel-${idx}`}
              id={`hotel-${idx}`}
              title={`Отель ${idx + 1}`}
              subtitle={hotelSubtitle(hotel) || undefined}
              contentClassName="grid gap-4 grid-cols-1 sm:grid-cols-2"
              actions={
                <>
                  <AiFillDialog
                    category="hotel"
                    compact
                    onExtracted={(d) =>
                      applyToCard(setHotels, idx, "hotels", d)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setHotels((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              }
            >
              <div className="space-y-2">
                <Label>Название отеля</Label>
                <Input
                  placeholder="Rixos Premium"
                  value={hotel.hotelName}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "hotelName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон отеля</Label>
                <Input
                  placeholder="+90 242 310 41 00"
                  value={hotel.hotelPhone}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "hotelPhone", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Адрес</Label>
                <Textarea
                  placeholder="Адрес отеля"
                  value={hotel.hotelAddress}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "hotelAddress", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in</Label>
                <Input
                  placeholder="14:00"
                  value={hotel.checkinTime}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "checkinTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input
                  placeholder="12:00"
                  value={hotel.checkoutTime}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "checkoutTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Дата заезда</Label>
                <Input
                  type="date"
                  value={hotel.checkinDate ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "checkinDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Дата выезда</Label>
                <Input
                  type="date"
                  value={hotel.checkoutDate ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "checkoutDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Тип номера</Label>
                <Input
                  placeholder="Deluxe Double Room"
                  value={hotel.roomType ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "roomType", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Питание</Label>
                <Input
                  placeholder="Завтрак включён"
                  value={hotel.mealPlan ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "mealPlan", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Гость</Label>
                <Input
                  placeholder="Имя гостя"
                  value={hotel.guestName ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "guestName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>№ подтверждения</Label>
                <Input
                  placeholder="12345678"
                  value={hotel.confirmationNumber ?? ""}
                  onChange={(e) =>
                    updateItem(
                      setHotels,
                      idx,
                      "confirmationNumber",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>PIN</Label>
                <Input
                  placeholder="1234"
                  value={hotel.pin ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "pin", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  placeholder="250.00 EUR"
                  value={hotel.price ?? ""}
                  onChange={(e) =>
                    updateItem(setHotels, idx, "price", e.target.value)
                  }
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Правила отмены</Label>
                <Textarea
                  rows={2}
                  placeholder="Бесплатная отмена до..."
                  value={hotel.cancellationPolicy ?? ""}
                  onChange={(e) =>
                    updateItem(
                      setHotels,
                      idx,
                      "cancellationPolicy",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Особые пожелания</Label>
                <Textarea
                  rows={2}
                  placeholder="Non-smoking room, high floor..."
                  value={hotel.specialRequests ?? ""}
                  onChange={(e) =>
                    updateItem(
                      setHotels,
                      idx,
                      "specialRequests",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="col-span-full space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Сообщения от отеля</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      setHotels((prev) => {
                        const next = [...prev];
                        next[idx] = {
                          ...next[idx],
                          propertyMessages: [
                            ...(next[idx].propertyMessages ?? []),
                            "",
                          ],
                        };
                        return next;
                      })
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" /> Добавить
                  </Button>
                </div>
                {(hotel.propertyMessages ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Нет сообщений. Нажмите «Добавить».
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(hotel.propertyMessages ?? []).map((msg, mi) => (
                      <div key={mi} className="flex gap-2 items-start">
                        <Textarea
                          rows={3}
                          placeholder={`Сообщение ${mi + 1}`}
                          value={msg}
                          onChange={(e) =>
                            setHotels((prev) => {
                              const next = [...prev];
                              const msgs = [
                                ...(next[idx].propertyMessages ?? []),
                              ];
                              msgs[mi] = e.target.value;
                              next[idx] = {
                                ...next[idx],
                                propertyMessages: msgs,
                              };
                              return next;
                            })
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setHotels((prev) => {
                              const next = [...prev];
                              const msgs = (
                                next[idx].propertyMessages ?? []
                              ).filter((_, i) => i !== mi);
                              next[idx] = {
                                ...next[idx],
                                propertyMessages: msgs,
                              };
                              return next;
                            })
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SortableCard>
          ))}
        </SortableList>
      )}
    </div>
  );
}
