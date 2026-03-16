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

const MAX_FILES = 10;
const MAX_SIZE_MB = 5;

interface AiFillDialogProps {
  onExtracted: (data: Record<string, unknown>) => void;
  category?:
    | "flight"
    | "hotel"
    | "guide"
    | "transfer"
    | "insurance"
    | "attraction";
  compact?: boolean;
  endpoint?: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AiFillDialog({
  onExtracted,
  category,
  compact,
  endpoint = "/api/trips/extract",
  title = "AI заполнение поездки",
  description = "Загрузите один или несколько PDF/TXT файлов или вставьте текст — AI автоматически заполнит поля формы.",
  placeholder = "Вставьте текст бронирования, e-mail,\nданные рейса, отеля и т.д.",
}: AiFillDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setText("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    const valid: File[] = [];
    for (const f of arr) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Файл "${f.name}" больше ${MAX_SIZE_MB} МБ`);
        continue;
      }
      if (
        !f.type.includes("pdf") &&
        !f.type.includes("text") &&
        !f.name.endsWith(".pdf") &&
        !f.name.endsWith(".txt")
      ) {
        toast.error(`Формат "${f.name}" не поддерживается`);
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_FILES) {
        toast.warning(`Максимум ${MAX_FILES} файлов`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() {
    setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  async function handleExtract() {
    if (!text.trim() && files.length === 0) {
      toast.error("Введите текст или загрузите файл");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (files.length > 0) {
        for (const f of files) formData.append("files", f);
      } else {
        formData.append("text", text);
      }
      if (category) formData.append("category", category);

      const res = await fetch(endpoint, { method: "POST", body: formData });
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

  const hasFiles = files.length > 0;

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
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors
              ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"}`}
          >
            <Upload className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">
              Перетащите файлы сюда или нажмите для выбора
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, TXT · макс. {MAX_SIZE_MB} МБ на файл · до {MAX_FILES} файлов
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.csv,.html,application/pdf,text/plain"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* File list */}
          {hasFiles && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {f.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatBytes(f.size)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="shrink-0 rounded-sm p-0.5 hover:bg-foreground/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pl-1">
                {files.length} файл(ов) · нажмите зону выше чтобы добавить ещё
              </p>
            </div>
          )}

          {/* OR divider */}
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
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={hasFiles}
              className={hasFiles ? "opacity-40 cursor-not-allowed" : ""}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={loading || (!text.trim() && !hasFiles)}
            onClick={handleExtract}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {files.length > 1
                  ? `Анализирую ${files.length} файлов...`
                  : "Анализирую..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {files.length > 1
                  ? `Извлечь из ${files.length} файлов`
                  : "Извлечь данные"}
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
