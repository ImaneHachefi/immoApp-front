"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import { Users, Flame, Building, Ticket, CheckCircle, LayoutGrid } from "lucide-react";

interface DashboardData {
  totalProspects: number;
  prospectsChauds: number;
  prospectsTièdes: number;
  prospectsFroids: number;
  totalBiens: number;
  biensDisponibles: number;
  totalTickets: number;
  ticketsOuverts: number;
  ticketsEnCours: number;
  ticketsResolus: number;
  prospectsByStatut: Record<string, number>;
  ticketsByAgent: Record<string, number>;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg`} style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <div className="font-display text-4xl font-light mb-1.5" style={{ color }}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "AGENT_COMMERCIAL"]}>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">LuxImmo — Admin</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Dashboard Immobilier
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Aperçu des performances en temps réel</p>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Chargement des données...</div>
        ) : data ? (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Prospects" value={data.totalProspects} icon={<Users className="w-5 h-5" />} color="#6366f1" />
              <StatCard label="Prospects Chauds" value={data.prospectsChauds} icon={<Flame className="w-5 h-5" />} color="#f59e0b" />
              <StatCard label="Biens Disponibles" value={data.biensDisponibles} icon={<Building className="w-5 h-5" />} color="#10b981" />
              <StatCard label="Tickets Ouverts" value={data.ticketsOuverts} icon={<Ticket className="w-5 h-5" />} color="#ef4444" />
              <StatCard label="Tickets Résolus" value={data.ticketsResolus} icon={<CheckCircle className="w-5 h-5" />} color="#10b981" />
              <StatCard label="Total Biens" value={data.totalBiens} icon={<LayoutGrid className="w-5 h-5" />} color="#6366f1" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {/* Prospects par statut */}
              <div className="bg-surface border border-surface-border rounded-xl p-6">
                <h3 className="font-display text-xl font-medium text-foreground mb-5">
                  Prospects par Statut
                </h3>
                {Object.entries(data.prospectsByStatut || {}).map(([statut, count]) => {
                  const colors: Record<string, string> = {
                    NOUVEAU: "#6366f1", CONTACTE: "#f59e0b", INTERESSE: "#10b981",
                    EN_NEGOCIATION: "#a78bfa", CONVERTI: "#10b981", PERDU: "#ef4444",
                  };
                  const total = Object.values(data.prospectsByStatut).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={statut} className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{statut}</span>
                        <span className="text-xs font-semibold" style={{ color: colors[statut] || "#6366f1" }}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: colors[statut] || "#6366f1" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tickets par agent */}
              <div className="bg-surface border border-surface-border rounded-xl p-6">
                <h3 className="font-display text-xl font-medium text-foreground mb-5">
                  Tickets par Agent SAV
                </h3>
                {Object.entries(data.ticketsByAgent || {}).length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucun ticket assigné</p>
                ) : (
                  Object.entries(data.ticketsByAgent || {}).map(([agent, count]) => (
                    <div key={agent} className="flex items-center gap-3 py-3 border-b border-surface-border last:border-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                        {agent[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{agent}</div>
                        <div className="text-xs text-muted-foreground">{count} ticket{count > 1 ? "s" : ""}</div>
                      </div>
                      <span className="text-sm text-primary font-bold">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Qualification IA */}
            <div className="bg-surface border border-surface-border rounded-xl p-6">
              <h3 className="font-display text-xl font-medium text-foreground mb-5">
                Qualification IA des Prospects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Prospects Chauds", value: data.prospectsChauds, color: "#f59e0b", icon: <Flame className="w-6 h-6" /> },
                  { label: "Prospects Tièdes", value: data.prospectsTièdes, color: "#6366f1", icon: <Users className="w-6 h-6" /> },
                  { label: "Prospects Froids", value: data.prospectsFroids, color: "#94a3b8", icon: <Users className="w-6 h-6" /> },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-5 text-center border" style={{ backgroundColor: `${item.color}08`, borderColor: `${item.color}20` }}>
                    <div className="flex justify-center mb-3" style={{ color: item.color }}>{item.icon}</div>
                    <div className="font-display text-4xl font-light mb-1" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Erreur de chargement</p>
        )}
      </div>
    </ProtectedRoute>
  );
}