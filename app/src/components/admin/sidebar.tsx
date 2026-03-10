"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Поездки", href: "/admin/trips", icon: Plane },
  { name: "Клиенты", href: "/admin/clients", icon: Users },
  { name: "Сообщения", href: "/admin/messages", icon: MessageSquare },
  { name: "Настройки", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <Plane className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Trip Assistant</span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="fixed top-3 left-3 z-40 md:hidden" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
