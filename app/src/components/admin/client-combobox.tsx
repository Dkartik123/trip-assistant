"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientOption {
  id: string;
  name: string;
  language: string;
}

interface ClientComboboxProps {
  clients: ClientOption[];
  value: string;
  onValueChange: (id: string) => void;
  onClientCreated: (client: ClientOption) => void;
  agencyId: string;
  error?: string;
}

export function ClientCombobox({
  clients,
  value,
  onValueChange,
  onClientCreated,
  agencyId,
  error,
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // New client dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedClient = clients.find((c) => c.id === value);

  const filtered = search.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients;

  // Focus search on open
  useEffect(() => {
    if (open) {
      // small delay for popover animation
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSelect = useCallback(
    (id: string) => {
      onValueChange(id);
      setOpen(false);
      setSearch("");
    },
    [onValueChange],
  );

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          name: newName.trim(),
          phone: newPhone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Ошибка ${res.status}`);
      }

      const { data: created } = await res.json();
      const newClient: ClientOption = {
        id: created.id,
        name: created.name,
        language: created.language ?? "en",
      };

      onClientCreated(newClient);
      onValueChange(created.id);
      setDialogOpen(false);
      setNewName("");
      setNewPhone("");
      toast.success(`Клиент "${created.name}" создан`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось создать клиента",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>Клиент</Label>
      <div className="flex gap-2">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            className={cn(
              "flex h-8 w-full items-center justify-between rounded-lg border bg-transparent px-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50",
              error
                ? "border-destructive ring-3 ring-destructive/20"
                : "border-input",
              !selectedClient && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {selectedClient ? selectedClient.name : "Выберите клиента"}
            </span>
            <ChevronsUpDown className="ml-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Positioner
              side="bottom"
              sideOffset={4}
              align="start"
              className="z-50"
            >
              <Popover.Popup className="w-[var(--anchor-width)] min-w-[240px] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
                {/* Search */}
                <div className="flex items-center gap-2 border-b px-2 py-1.5">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    placeholder="Поиск клиента..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Client list */}
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {search ? "Клиент не найден" : "Нет клиентов"}
                    </p>
                  ) : (
                    filtered.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => handleSelect(client.id)}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === client.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate">{client.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {/* Quick add client button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Добавить клиента"
              />
            }
          >
            <UserPlus className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый клиент</DialogTitle>
              <DialogDescription>Быстрое добавление клиента</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-client-name">Имя *</Label>
                <Input
                  id="new-client-name"
                  placeholder="Иванов Иван"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-phone">Телефон</Label>
                <Input
                  id="new-client-phone"
                  placeholder="+7 (999) 123-45-67"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating || !newName.trim()}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {creating ? "Создание..." : "Добавить"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
