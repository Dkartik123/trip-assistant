"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { NoteItem } from "@/lib/types/trip-sections";

interface NotesSectionProps {
  noteCards: NoteItem[];
  setNoteCards: React.Dispatch<React.SetStateAction<NoteItem[]>>;
}

export function NotesSection({ noteCards, setNoteCards }: NotesSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Заметки</h2>
          <p className="text-sm text-muted-foreground">
            Дополнительная информация о поездке
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setNoteCards((prev) => [...prev, { title: "", text: "" }])
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Добавить
        </Button>
      </div>

      {noteCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Нет заметок. Нажмите «Добавить» чтобы создать.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {noteCards.map((note, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Input
                    placeholder="Заголовок заметки"
                    value={note.title}
                    className="border-0 p-0 text-sm font-medium shadow-none focus-visible:ring-0"
                    onChange={(e) => {
                      const next = [...noteCards];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setNoteCards(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setNoteCards((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="Текст заметки..."
                  rows={3}
                  value={note.text}
                  onChange={(e) => {
                    const next = [...noteCards];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setNoteCards(next);
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
