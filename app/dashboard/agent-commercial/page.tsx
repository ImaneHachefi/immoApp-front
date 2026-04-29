'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import Link from 'next/link';

export default function AgentCommercialDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');

  useEffect(() => {
    setNom(localStorage.getItem('nom') || 'Agent');
    api.get('/api/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Mes Prospects', value: data?.totalProspects || 0, icon: '👥', color: '#639dff', href: '/dashboard/agent-commercial/prospects' },
    { label: 'Prospects Chauds 🔥', value: data?.prospectsChauds || 0, icon: '🔥', color: '#f59e0b', href: '/dashboard/agent-commercial/qualification' },
    { label: 'Biens Disponibles', value: data?.biensDisponibles || 0, icon: '🏠', color: '#34d399', href: '/dashboard/agent-commercial/biens' },
    { label: 'Total Biens', value: data?.totalBiens || 0, icon: '🏘️', color: '#a78bfa', href: '/dashboard/agent-commercial/biens' },
  ];

  return (
    <ProtectedRoute allowedRoles={['AGENT_COMMERCIAL', 'ADMIN']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Tableau de bord</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: '#f0ece4', margin: 0 }}>
            Bonjour, <span style={{ fontStyle: 'italic', color: '#639dff' }}>{nom}</span>
          </h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 6 }}>Voici un aperçu de vos activités commerciales</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
          {cards.map((c, i) => (
            <Link key={i} href={c.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0b1825', borderRadius: 12, padding: '24px', border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 24, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: c.color, lineHeight: 1 }}>{loading ? '—' : c.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.45)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>Répartition IA</h3>
            {[
              { label: 'Prospects Chauds', value: data?.prospectsChauds || 0, color: '#f59e0b', icon: '🔥' },
              { label: 'Prospects Tièdes', value: data?.prospectsTièdes || 0, color: '#639dff', icon: '🌤️' },
              { label: 'Prospects Froids', value: data?.prospectsFroids || 0, color: '#94a3b8', icon: '❄️' },
            ].map((item, i) => {
              const total = (data?.totalProspects || 1);
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'rgba(240,236,228,0.7)' }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize: 13, color: item.color, fontWeight: 600 }}>{item.value}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 100, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#0b1825', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>Actions rapides</h3>
            {[
              { label: 'Voir mes prospects', href: '/dashboard/agent-commercial/prospects', icon: '👥', color: '#639dff' },
              { label: 'Gérer les biens', href: '/dashboard/agent-commercial/biens', icon: '🏠', color: '#34d399' },
              { label: 'Qualification IA', href: '/dashboard/agent-commercial/qualification', icon: '🤖', color: '#f59e0b' },
            ].map((action, i) => (
              <Link key={i} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}>
                  <span style={{ fontSize: 18 }}>{action.icon}</span>
                  <span style={{ fontSize: 13, color: action.color, fontWeight: 500 }}>{action.label}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(240,236,228,0.3)', fontSize: 16 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}