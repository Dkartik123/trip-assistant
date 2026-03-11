"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, FileText, X, Loader2 } from "lucide-react";

interface AiFillDialogProps {
  onExtracted: (data: Record<string, unknown>) => void;
  category?: "flight" | "hotel" | "guide" | "transfer" | "insurance" | "attraction";
  compact?: boolean;
  /** API endpoint to POST to (default: /api/trips/extract) */
  endpoint?: string;
  /** Dialog title override */
  title?: string;
  /** Dialog description override */
  description?: string;
  /** Textarea placeholder override */
  placeholder?: string;
}

export function AiFillDialog({
  onExtracted,
  category,
  compact,
  endpoint = "/api/trips/extract",
  title = "AI заполнение поездки",
  description = "Вставьте текст бронирования, e-mail подтверждения или загрузите PDF — AI автоматически заполнит поля формы.",
  placeholder = "Вставьте текст бронирования, e-mail,\nданные рейса, отеля и т.д.",
}: AiFillDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setText("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    setFile(f);
  }

  async function handleExtract() {
    if (!text.trim() && !file) {
      toast.error("Введите текст или загрузите файл");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }
      if (category) {
        formData.append("category", category);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Ошибка ${res.status}`);
      }

      const { data } = await res.json();
      const fieldCount = Object.keys(data).length;

      if (fieldCount === 0) {
        toast.warning("AI не нашёл данных в тексте");
        return;
      }

      onExtracted(data as Record<string, unknown>);
      toast.success(`Заполнено ${fieldCount} ${pluralFields(fieldCount)}`);
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка извлечения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          compact ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="AI заполнение"
            />
          ) : (
            <Button type="button" variant="outline" className="gap-2" />
          )
        }
      >
        <Sparkles className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {!compact && (
          <>
            <span className="hidden sm:inline">AI заполнение</span>
            <span className="sm:hidden">AI</span>
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label>Файл (PDF, TXT)</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.csv,.html,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Загрузить файл
              </Button>
              {file && (
                <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ml-1 shrink-0 rounded-sm hover:bg-foreground/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                или
              </span>
            </div>
          </div>

          {/* Text input */}
          <div className="space-y-2">
            <Label>Текст</Label>
            <Textarea
              placeholder={placeholder}
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!!file}
              className={file ? "opacity-50" : ""}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={loading || (!text.trim() && !file)}
            onClick={handleExtract}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Анализирую...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Извлечь данные
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function pluralFields(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "поле";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "поля";
  return "полей";
}
