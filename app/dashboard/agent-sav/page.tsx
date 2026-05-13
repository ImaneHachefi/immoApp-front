"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import Link from "next/link";
import { Ticket, FolderOpen, Settings2, CheckCircle, Lock, ChevronRight, AlertTriangle } from "lucide-react";

interface TicketData {
  id: number;
  sujet: string;
  statut: string;
  priorite: string;
  nomClient?: string;
}

const statutColors: Record<string, string> = { OUVERT: "#f59e0b", EN_COURS: "#6366f1", RESOLU: "#10b981", FERME: "#94a3b8" };
const prioriteColors: Record<string, string> = { HAUTE: "#ef4444", MOYENNE: "#f59e0b", BASSE: "#10b981" };

export default function AgentSAVDashboard() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");

  useEffect(() => {
    setNom(localStorage.getItem("nom") || "Agent SAV");
    api.get("/api/tickets")
      .then((r) => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tickets.length,
    ouverts: tickets.filter((t) => t.statut === "OUVERT").length,
    enCours: tickets.filter((t) => t.statut === "EN_COURS").length,
    resolus: tickets.filter((t) => t.statut === "RESOLU").length,
    fermes: tickets.filter((t) => t.statut === "FERME").length,
  };

  const recent = tickets.slice(0, 5);
  const taux = stats.total > 0 ? Math.round(((stats.resolus + stats.fermes) / stats.total) * 100) : 0;
  const tauxColor = taux >= 70 ? "#10b981" : taux >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <ProtectedRoute allowedRoles={["AGENT_SAV", "ADMIN"]}>
      <div className="max-w-[1100px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">Service Après-Vente</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Bonjour, <span className="italic text-primary">{nom}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Tableau de bord du support client</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "var(--foreground)", icon: <Ticket className="w-5 h-5" /> },
            { label: "Ouverts", value: stats.ouverts, color: "#f59e0b", icon: <FolderOpen className="w-5 h-5" /> },
            { label: "En Cours", value: stats.enCours, color: "#6366f1", icon: <Settings2 className="w-5 h-5" /> },
            { label: "Résolus", value: stats.resolus, color: "#10b981", icon: <CheckCircle className="w-5 h-5" /> },
            { label: "Fermés", value: stats.fermes, color: "#94a3b8", icon: <Lock className="w-5 h-5" /> },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-surface-border rounded-xl p-5 text-center">
              <div className="flex justify-center mb-3" style={{ color: s.color }}>{s.icon}</div>
              <div className="font-display text-3xl font-light mb-1" style={{ color: s.color }}>
                {loading ? "—" : s.value}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Tickets récents */}
          <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center">
              <h3 className="font-display text-lg font-medium text-foreground">Tickets Récents</h3>
              <Link href="/dashboard/agent-sav/tickets" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Chargement...</div>
            ) : recent.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Aucun ticket</div>
            ) : (
              recent.map((t) => (
                <div key={t.id} className="px-6 py-3.5 border-b border-surface-border last:border-0 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">#{t.id}</span>
                      <span className="text-sm font-medium text-foreground truncate">{t.sujet}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.nomClient || "Client"}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: `${statutColors[t.statut]}15`, color: statutColors[t.statut] }}>
                      {t.statut}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: `${prioriteColors[t.priorite]}15`, color: prioriteColors[t.priorite] }}>
                      {t.priorite}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Taux résolution */}
            <div className="bg-surface border border-surface-border rounded-xl p-6">
              <h3 className="font-display text-lg font-medium text-foreground mb-4">Taux de résolution</h3>
              <div className="font-display text-5xl font-light text-center mb-3" style={{ color: tauxColor }}>{taux}%</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${taux}%`, backgroundColor: tauxColor }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">{stats.resolus + stats.fermes} / {stats.total} tickets</p>
            </div>

            {/* Actions rapides */}
            <div className="bg-surface border border-surface-border rounded-xl p-6">
              <h3 className="font-display text-lg font-medium text-foreground mb-4">Actions rapides</h3>
              <Link href="/dashboard/agent-sav/tickets">
                <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg mb-3 hover:bg-primary/10 transition-colors cursor-pointer">
                  <div className="text-sm text-primary font-medium flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> Gérer les tickets
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stats.ouverts} ticket{stats.ouverts > 1 ? "s" : ""} en attente</div>
                </div>
              </Link>
              {stats.ouverts > 0 && (
                <div className="px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-xs text-amber-500 font-medium">{stats.ouverts} ticket{stats.ouverts > 1 ? "s" : ""} non traité{stats.ouverts > 1 ? "s" : ""}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}