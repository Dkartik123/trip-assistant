"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane, Plus, X, TrainFront } from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type { FlightItem, RouteType, ExtractedTripData } from "@/lib/types/trip-sections";
import { emptyFlight, emptyPassenger } from "@/lib/types/trip-sections";
import { updateItem } from "@/lib/utils/form-helpers";
import { applyToCard, mergeIncomingFlights } from "./use-trip-form";

interface FlightSectionProps {
  flights: FlightItem[];
  setFlights: React.Dispatch<React.SetStateAction<FlightItem[]>>;
}

export function FlightSection({ flights, setFlights }: FlightSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Рейсы</h3>
        <div className="flex gap-2">
          <AiFillDialog
            category="flight"
            compact
            onExtracted={(d) => {
              const arr = (d as ExtractedTripData).flights;
              if (arr?.length)
                setFlights((prev) => mergeIncomingFlights(prev, arr));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFlights((prev) => [...prev, { ...emptyFlight }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
          </Button>
        </div>
      </div>

      {flights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Plane className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нет рейсов. Нажмите «Добавить» или используйте AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flights.map((flight, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {(flight.type ?? "flight") === "train" ? (
                      <TrainFront className="h-4 w-4" />
                    ) : (
                      <Plane className="h-4 w-4" />
                    )}
                    {(flight.type ?? "flight") === "train" ? "Поезд" : "Рейс"} {idx + 1}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <AiFillDialog
                      category="flight"
                      compact
                      onExtracted={(d) =>
                        applyToCard(setFlights, idx, "flights", d)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setFlights((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Type selector */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label>Тип маршрута</Label>
                  <Select
                    value={(flight.type ?? "flight") as string}
                    onValueChange={(v) =>
                      v && updateItem(setFlights, idx, "type", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">✈️ Авиарейс</SelectItem>
                      <SelectItem value="train">🚆 Поезд</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Дата и время отправления</Label>
                  <Input
                    type="datetime-local"
                    value={flight.flightDate}
                    onChange={(e) =>
                      updateItem(setFlights, idx, "flightDate", e.target.value)
                    }
                  />
                </div>

                {/* Flight-specific fields */}
                {((flight.type ?? "flight") as RouteType) === "flight" && (
                  <>
                    <div className="space-y-2">
                      <Label>Номер рейса</Label>
                      <Input
                        placeholder="SU2134"
                        value={flight.flightNumber}
                        onChange={(e) =>
                          updateItem(
                            setFlights,
                            idx,
                            "flightNumber",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Гейт</Label>
                      <Input
                        placeholder="A12"
                        value={flight.gate}
                        onChange={(e) =>
                          updateItem(setFlights, idx, "gate", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {/* Train-specific fields */}
                {((flight.type ?? "flight") as RouteType) === "train" && (
                  <>
                    <div className="space-y-2">
                      <Label>Номер поезда</Label>
                      <Input
                        placeholder="ICE 374"
                        value={flight.trainNumber ?? ""}
                        onChange={(e) =>
                          updateItem(
                            setFlights,
                            idx,
                            "trainNumber",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Место / Вагон</Label>
                      <Input
                        placeholder="Вагон 5, Место 23"
                        value={flight.seat ?? ""}
                        onChange={(e) =>
                          updateItem(setFlights, idx, "seat", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Класс</Label>
                      <Input
                        placeholder="2nd, 1st, business"
                        value={flight.carriageClass ?? ""}
                        onChange={(e) =>
                          updateItem(
                            setFlights,
                            idx,
                            "carriageClass",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Город отправления</Label>
                  <Input
                    placeholder="Москва"
                    value={flight.departureCity}
                    onChange={(e) =>
                      updateItem(
                        setFlights,
                        idx,
                        "departureCity",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Airport fields for flights */}
                {((flight.type ?? "flight") as RouteType) === "flight" && (
                  <div className="space-y-2">
                    <Label>Аэропорт вылета</Label>
                    <Input
                      placeholder="SVO"
                      value={flight.departureAirport}
                      onChange={(e) =>
                        updateItem(
                          setFlights,
                          idx,
                          "departureAirport",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                {/* Station fields for trains */}
                {((flight.type ?? "flight") as RouteType) === "train" && (
                  <div className="space-y-2">
                    <Label>Станция отправления</Label>
                    <Input
                      placeholder="Firenze S.M.N."
                      value={flight.departureStation ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setFlights,
                          idx,
                          "departureStation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                <Separator className="col-span-full" />
                <div className="space-y-2">
                  <Label>Город прибытия</Label>
                  <Input
                    placeholder="Анталья"
                    value={flight.arrivalCity}
                    onChange={(e) =>
                      updateItem(
                        setFlights,
                        idx,
                        "arrivalCity",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Airport for flights */}
                {((flight.type ?? "flight") as RouteType) === "flight" && (
                  <div className="space-y-2">
                    <Label>Аэропорт прибытия</Label>
                    <Input
                      placeholder="AYT"
                      value={flight.arrivalAirport}
                      onChange={(e) =>
                        updateItem(
                          setFlights,
                          idx,
                          "arrivalAirport",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                {/* Station for trains */}
                {((flight.type ?? "flight") as RouteType) === "train" && (
                  <div className="space-y-2">
                    <Label>Станция прибытия</Label>
                    <Input
                      placeholder="Venezia S. Lucia"
                      value={flight.arrivalStation ?? ""}
                      onChange={(e) =>
                        updateItem(
                          setFlights,
                          idx,
                          "arrivalStation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Дата и время прибытия</Label>
                  <Input
                    type="datetime-local"
                    value={flight.arrivalDate}
                    onChange={(e) =>
                      updateItem(
                        setFlights,
                        idx,
                        "arrivalDate",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Passengers */}
                <Separator className="col-span-full" />
                <div className="col-span-full space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Пассажиры</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setFlights((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...next[idx],
                            passengers: [
                              ...(next[idx].passengers ?? []),
                              { ...emptyPassenger },
                            ],
                          };
                          return next;
                        });
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Пассажир
                    </Button>
                  </div>
                  {(flight.passengers ?? []).map((pax, pIdx) => (
                    <PassengerRow
                      key={pIdx}
                      pax={pax}
                      pIdx={pIdx}
                      flightIdx={idx}
                      setFlights={setFlights}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Passenger Row ───────────────────────────────────────

interface PassengerRowProps {
  pax: FlightItem["passengers"][number];
  pIdx: number;
  flightIdx: number;
  setFlights: React.Dispatch<React.SetStateAction<FlightItem[]>>;
}

function PassengerRow({
  pax,
  pIdx,
  flightIdx: idx,
  setFlights,
}: PassengerRowProps) {
  function updatePax(field: string, value: string) {
    setFlights((prev) => {
      const next = [...prev];
      const paxList = [...next[idx].passengers];
      paxList[pIdx] = { ...paxList[pIdx], [field]: value };
      next[idx] = { ...next[idx], passengers: paxList };
      return next;
    });
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Пассажир {pIdx + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => {
            setFlights((prev) => {
              const next = [...prev];
              next[idx] = {
                ...next[idx],
                passengers: next[idx].passengers.filter((_, i) => i !== pIdx),
              };
              return next;
            });
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Имя</Label>
          <Input
            placeholder="Имя Фамилия"
            value={pax.name}
            onChange={(e) => updatePax("name", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Дата рождения</Label>
          <Input
            placeholder="01.05.95"
            value={pax.dateOfBirth}
            onChange={(e) => updatePax("dateOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Тип</Label>
          <Select
            value={pax.type || "adult"}
            onValueChange={(v) => {
              if (!v) return;
              updatePax("type", v);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Взрослый</SelectItem>
              <SelectItem value="child">Ребёнок</SelectItem>
              <SelectItem value="infant">Младенец</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Багаж</Label>
          <Input
            placeholder="55cm×40cm×20cm 10kg"
            value={pax.baggage}
            onChange={(e) => updatePax("baggage", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Цена багажа</Label>
          <Input
            placeholder="49.49 EUR"
            value={pax.baggagePrice}
            onChange={(e) => updatePax("baggagePrice", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Цена билета</Label>
          <Input
            placeholder="148.91 EUR"
            value={pax.ticketPrice}
            onChange={(e) => updatePax("ticketPrice", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
