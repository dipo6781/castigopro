"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, Upload, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cola", label: "Mi Cola", icon: ListOrdered },
  { href: "/importar", label: "Importar", icon: Upload },
  { href: "/config", label: "Config", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const agentName = useAppStore((s) => s.agentName);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900">
              CastigoPro
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              Cartera Castigada
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs sm:block">
            <div className="font-medium text-slate-800">{agentName}</div>
            <div className="text-slate-500">Agente activo</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {agentName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <nav className="flex border-t border-slate-100 sm:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-brand-600" : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
