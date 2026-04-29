'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

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

function StatCard({ label, value, sub, color = '#639dff', icon }: any) {
  return (
    <div style={{
      background: '#0b1825', borderRadius: 12, padding: '24px',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {sub && <span style={{ fontSize: 11, color: sub.startsWith('+') ? '#34d399' : '#f87171', background: sub.startsWith('+') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', padding: '3px 8px', borderRadius: 100 }}>{sub}</span>}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>SupHouse — Admin</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', letterSpacing: '-0.02em', margin: 0 }}>
            Dashboard Immobilier
          </h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 6 }}>Aperçu des performances en temps réel</p>
        </div>

        {loading ? (
          <div style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14 }}>Chargement des données...</div>
        ) : data ? (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Prospects" value={data.totalProspects} icon="👥" sub="+5.8% ce mois" />
              <StatCard label="Prospects Chauds" value={data.prospectsChauds} icon="🔥" color="#f59e0b" sub="+12%" />
              <StatCard label="Biens Disponibles" value={data.biensDisponibles} icon="🏠" color="#34d399" />
              <StatCard label="Tickets Ouverts" value={data.ticketsOuverts} icon="🎫" color="#f87171" sub={data.ticketsOuverts > 5 ? '+urgent' : 'OK'} />
              <StatCard label="Tickets Résolus" value={data.ticketsResolus} icon="✅" color="#34d399" />
              <StatCard label="Total Biens" value={data.totalBiens} icon="🏘️" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {/* Prospects par statut */}
              <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 20px' }}>
                  Prospects par Statut
                </h3>
                {Object.entries(data.prospectsByStatut || {}).map(([statut, count]) => {
                  const colors: Record<string, string> = { NOUVEAU: '#639dff', CONTACTE: '#f59e0b', INTERESSE: '#34d399', EN_NEGOCIATION: '#a78bfa', CONVERTI: '#10b981', PERDU: '#f87171' };
                  const total = Object.values(data.prospectsByStatut).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={statut} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.7)' }}>{statut}</span>
                        <span style={{ fontSize: 12, color: colors[statut] || '#639dff', fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[statut] || '#639dff', borderRadius: 100, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tickets par agent */}
              <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 20px' }}>
                  Tickets par Agent SAV
                </h3>
                {Object.entries(data.ticketsByAgent || {}).length === 0 ? (
                  <p style={{ color: 'rgba(240,236,228,0.4)', fontSize: 13 }}>Aucun ticket assigné</p>
                ) : Object.entries(data.ticketsByAgent || {}).map(([agent, count]) => (
                  <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                      {agent[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#f0ece4', fontWeight: 500 }}>{agent}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>{count} ticket{count > 1 ? 's' : ''}</div>
                    </div>
                    <span style={{ fontSize: 13, color: '#639dff', fontWeight: 600 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Catégories IA */}
            <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 20px' }}>
                Qualification IA des Prospects
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Prospects Chauds', value: data.prospectsChauds, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🔥' },
                  { label: 'Prospects Tièdes', value: data.prospectsTièdes, color: '#639dff', bg: 'rgba(99,157,255,0.1)', icon: '🌤️' },
                  { label: 'Prospects Froids', value: data.prospectsFroids, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '❄️' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: '20px', textAlign: 'center', border: `1px solid ${item.color}20` }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.6)', marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'rgba(240,236,228,0.5)' }}>Erreur de chargement</p>
        )}
      </div>
    </ProtectedRoute>
  );
}