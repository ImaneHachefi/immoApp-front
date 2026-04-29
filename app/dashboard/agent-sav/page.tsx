'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import Link from 'next/link';

export default function AgentSAVDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');

  useEffect(() => {
    setNom(localStorage.getItem('nom') || 'Agent SAV');
    api.get('/api/tickets').then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tickets.length,
    ouverts: tickets.filter(t => t.statut === 'OUVERT').length,
    enCours: tickets.filter(t => t.statut === 'EN_COURS').length,
    resolus: tickets.filter(t => t.statut === 'RESOLU').length,
    fermes: tickets.filter(t => t.statut === 'FERME').length,
  };

  const recent = tickets.slice(0, 5);

  const statutColors: Record<string, string> = { OUVERT: '#f59e0b', EN_COURS: '#639dff', RESOLU: '#34d399', FERME: '#94a3b8' };
  const prioriteColors: Record<string, string> = { HAUTE: '#f87171', MOYENNE: '#f59e0b', BASSE: '#34d399' };

  return (
    <ProtectedRoute allowedRoles={['AGENT_SAV', 'ADMIN']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Service Après-Vente</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: '#f0ece4', margin: 0 }}>
            Bonjour, <span style={{ fontStyle: 'italic', color: '#639dff' }}>{nom}</span>
          </h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 6 }}>Tableau de bord du support client</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Total Tickets', value: stats.total, color: '#f0ece4', icon: '🎫' },
            { label: 'Ouverts', value: stats.ouverts, color: '#f59e0b', icon: '📂' },
            { label: 'En Cours', value: stats.enCours, color: '#639dff', icon: '⚙️' },
            { label: 'Résolus', value: stats.resolus, color: '#34d399', icon: '✅' },
            { label: 'Fermés', value: stats.fermes, color: '#94a3b8', icon: '🔒' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#0b1825', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, color: s.color, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

          {/* Tickets récents */}
          <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: 0 }}>Tickets Récents</h3>
              <Link href="/dashboard/agent-sav/tickets" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 12, color: '#639dff', cursor: 'pointer' }}>Voir tout →</span>
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Chargement...</div>
            ) : recent.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Aucun ticket</div>
            ) : recent.map((t, i) => (
              <div key={t.id} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)' }}>#{t.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4' }}>{t.sujet}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>👤 {t.nomClient || 'Client'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${statutColors[t.statut]}18`, color: statutColors[t.statut], fontWeight: 600 }}>{t.statut}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${prioriteColors[t.priorite]}18`, color: prioriteColors[t.priorite], fontWeight: 600 }}>{t.priorite}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions + Taux résolution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Taux résolution */}
            <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>Taux de résolution</h3>
              {(() => {
                const taux = stats.total > 0 ? Math.round(((stats.resolus + stats.fermes) / stats.total) * 100) : 0;
                return (
                  <>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: taux >= 70 ? '#34d399' : taux >= 40 ? '#f59e0b' : '#f87171', textAlign: 'center', marginBottom: 12 }}>{taux}%</div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${taux}%`, background: taux >= 70 ? '#34d399' : taux >= 40 ? '#f59e0b' : '#f87171', borderRadius: 100, transition: 'width 1s ease' }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', textAlign: 'center', marginTop: 8 }}>{stats.resolus + stats.fermes} / {stats.total} tickets</p>
                  </>
                );
              })()}
            </div>

            {/* Actions rapides */}
            <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>Actions rapides</h3>
              <Link href="/dashboard/agent-sav/tickets" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '12px 14px', background: 'rgba(99,157,255,0.08)', border: '1px solid rgba(99,157,255,0.15)', borderRadius: 8, marginBottom: 10, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,157,255,0.15)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,157,255,0.08)'}>
                  <div style={{ fontSize: 13, color: '#639dff', fontWeight: 500 }}>🎫 Gérer les tickets</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginTop: 3 }}>{stats.ouverts} ticket{stats.ouverts > 1 ? 's' : ''} en attente</div>
                </div>
              </Link>
              {stats.ouverts > 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#f59e0b' }}>⚠️ {stats.ouverts} ticket{stats.ouverts > 1 ? 's' : ''} non traité{stats.ouverts > 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}