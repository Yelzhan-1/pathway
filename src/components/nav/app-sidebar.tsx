"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { strings } from "@/lib/strings";
import { cn } from "cn";

import { navItems } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card px-4 py-6 md:flex">
      <div className="mb-8 px-2 text-lg font-semibold tracking-tight">
        {strings.app.name}
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
