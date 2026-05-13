"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNom, getRole, logout } from "../lib/auth";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Users, Settings, Building, UserCheck, Bot,
  Ticket, MessageSquare, Sun, Moon, LogOut, ChevronRight, Menu, X,
} from "lucide-react";
import clsx from "clsx";

type MenuItem = { icon: React.ReactNode; label: string; href: string };

const menus: Record<string, MenuItem[]> = {
  ADMIN: [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Tableau de bord", href: "/dashboard/admin" },
    { icon: <Users className="w-4 h-4" />, label: "Utilisateurs", href: "/dashboard/admin/utilisateurs" },
    { icon: <Settings className="w-4 h-4" />, label: "Paramètres", href: "/dashboard/admin/parametres" },
  ],
  AGENT_COMMERCIAL: [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", href: "/dashboard/agent-commercial" },
    { icon: <Building className="w-4 h-4" />, label: "Biens", href: "/dashboard/agent-commercial/biens" },
    { icon: <UserCheck className="w-4 h-4" />, label: "Prospects", href: "/dashboard/agent-commercial/prospects" },
    { icon: <Bot className="w-4 h-4" />, label: "Qualification IA", href: "/dashboard/agent-commercial/qualification" },
  ],
  AGENT_SAV: [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", href: "/dashboard/agent-sav" },
    { icon: <Ticket className="w-4 h-4" />, label: "Tickets SAV", href: "/dashboard/agent-sav/tickets" },
  ],
  CLIENT: [
    { icon: <Building className="w-4 h-4" />, label: "Catalogue", href: "/dashboard/client" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Chatbot", href: "/dashboard/client/chatbot" },
    { icon: <Ticket className="w-4 h-4" />, label: "Mes Tickets", href: "/dashboard/client/tickets" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setNom(getNom() || "");
    setRole(getRole() || "");
    setMounted(true);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const items = menus[role] || [];
  const initials = nom
    ? nom.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "LX";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Building className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground tracking-tight">
            LuxImmo
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={closeMobile}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-surface-border flex flex-col gap-3">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer w-full"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}</span>
          </button>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">{nom}</div>
            <div className="text-xs text-muted-foreground">{role?.replace("_", " ")}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all cursor-pointer w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-surface/95 backdrop-blur-xl border-b border-surface-border flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground tracking-tight">LuxImmo</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── MOBILE BACKDROP ── */}
      <div
        className={clsx(
          "md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <aside
        className={clsx(
          "md:hidden fixed top-0 left-0 z-[70] w-[280px] max-w-[85vw] h-full bg-surface border-r border-surface-border flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-[260px] min-h-screen bg-surface border-r border-surface-border flex-col fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>
    </>
  );
}