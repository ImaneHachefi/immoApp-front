"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import Link from "next/link";
import { Users, Flame, Building, LayoutGrid, UserCheck, Bot, ChevronRight } from "lucide-react";

export default function AgentCommercialDashboard() {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");

  useEffect(() => {
    setNom(localStorage.getItem("nom") || "Agent");
    api.get("/api/dashboard")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Mes Prospects", value: data?.totalProspects ?? 0, icon: <Users className="w-5 h-5" />, color: "#6366f1", href: "/dashboard/agent-commercial/prospects" },
    { label: "Prospects Chauds", value: data?.prospectsChauds ?? 0, icon: <Flame className="w-5 h-5" />, color: "#f59e0b", href: "/dashboard/agent-commercial/qualification" },
    { label: "Biens Disponibles", value: data?.biensDisponibles ?? 0, icon: <Building className="w-5 h-5" />, color: "#10b981", href: "/dashboard/agent-commercial/biens" },
    { label: "Total Biens", value: data?.totalBiens ?? 0, icon: <LayoutGrid className="w-5 h-5" />, color: "#a78bfa", href: "/dashboard/agent-commercial/biens" },
  ];

  return (
    <ProtectedRoute allowedRoles={["AGENT_COMMERCIAL", "ADMIN"]}>
      <div className="max-w-[1100px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">Tableau de bord</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Bonjour, <span className="italic text-primary">{nom}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Voici un aperçu de vos activités commerciales</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="group">
              <div className="bg-surface border border-surface-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="p-2.5 rounded-lg w-fit mb-4" style={{ backgroundColor: `${c.color}15` }}>
                  <div style={{ color: c.color }}>{c.icon}</div>
                </div>
                <div className="font-display text-4xl font-light mb-1.5" style={{ color: c.color }}>
                  {loading ? "—" : c.value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{c.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* IA Répartition */}
          <div className="bg-surface border border-surface-border rounded-xl p-6">
            <h3 className="font-display text-xl font-medium text-foreground mb-5">Répartition IA</h3>
            {[
              { label: "Prospects Chauds", value: data?.prospectsChauds ?? 0, color: "#f59e0b", icon: <Flame className="w-4 h-4" /> },
              { label: "Prospects Tièdes", value: data?.prospectsTièdes ?? 0, color: "#6366f1", icon: <Users className="w-4 h-4" /> },
              { label: "Prospects Froids", value: data?.prospectsFroids ?? 0, color: "#94a3b8", icon: <Users className="w-4 h-4" /> },
            ].map((item) => {
              const total = data?.totalProspects || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label} className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <span style={{ color: item.color }}>{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions rapides */}
          <div className="bg-surface border border-surface-border rounded-xl p-6">
            <h3 className="font-display text-xl font-medium text-foreground mb-5">Actions rapides</h3>
            {[
              { label: "Voir mes prospects", href: "/dashboard/agent-commercial/prospects", icon: <UserCheck className="w-4 h-4" />, color: "#6366f1" },
              { label: "Gérer les biens", href: "/dashboard/agent-commercial/biens", icon: <Building className="w-4 h-4" />, color: "#10b981" },
              { label: "Qualification IA", href: "/dashboard/agent-commercial/qualification", icon: <Bot className="w-4 h-4" />, color: "#f59e0b" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 bg-muted/30 border border-surface-border hover:bg-muted transition-colors cursor-pointer group">
                  <span style={{ color: action.color }}>{action.icon}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}