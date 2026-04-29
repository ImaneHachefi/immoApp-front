'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Prospect { id: number; nomClient: string; emailClient: string; budget: number; localisation: string; statut: string; scoreIA: number; categorieIA: string; }

const catIcon: Record<string, string> = { CHAUD: '🔥', TIEDE: '🌤️', FROID: '❄️' };
const catColor: Record<string, string> = { CHAUD: '#f59e0b', TIEDE: '#639dff', FROID: '#94a3b8' };

export default function QualificationIA() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prospect | null>(null);

  useEffect(() => {
    api.get('/api/prospects').then(r => setProspects(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chauds = prospects.filter(p => p.categorieIA === 'CHAUD');
  const tièdes = prospects.filter(p => p.categorieIA === 'TIEDE');
  const froids = prospects.filter(p => p.categorieIA === 'FROID');
  const avgScore = prospects.length > 0 ? Math.round(prospects.reduce((a, p) => a + (p.scoreIA || 0), 0) / prospects.length) : 0;
  const converted = prospects.filter(p => p.statut === 'CONVERTI').length;
  const convRate = prospects.length > 0 ? Math.round((converted / prospects.length) * 100) : 0;

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Intelligence Artificielle</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Qualification des Prospects</h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>Analyse prédictive des opportunités de vente par l'IA</p>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Prospects', value: prospects.length, icon: '👥', color: '#639dff' },
            { label: 'Score Moyen', value: `${avgScore}%`, icon: '📊', color: '#a78bfa', sub: '+2.7% amélioration' },
            { label: 'Taux Conversion', value: `${convRate}%`, icon: '📈', color: '#34d399' },
            { label: 'Opportunités IA', value: chauds.length, icon: '🤖', color: '#f59e0b', sub: `${chauds.length} action${chauds.length > 1 ? 's' : ''} requise${chauds.length > 1 ? 's' : ''}` },
          ].map((k, i) => (
            <div key={i} style={{ background: '#0b1825', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{k.icon}</span>
                {k.sub && <span style={{ fontSize: 10, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 100 }}>{k.sub}</span>}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* Prospects list */}
          <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: 0 }}>Prospects Prioritaires</h2>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Chargement...</div>
            ) : (
              <div>
                {[...prospects].sort((a, b) => (b.scoreIA || 0) - (a.scoreIA || 0)).map(p => (
                  <div key={p.id} onClick={() => setSelected(p)} style={{
                    padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'background 0.2s',
                    background: selected?.id === p.id ? 'rgba(99,157,255,0.06)' : 'transparent',
                  }}
                    onMouseEnter={e => { if (selected?.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { if (selected?.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${catColor[p.categorieIA]}22`, border: `2px solid ${catColor[p.categorieIA]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: catColor[p.categorieIA], flexShrink: 0 }}>
                        {p.nomClient?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#f0ece4' }}>{p.nomClient || 'Client'}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${catColor[p.categorieIA]}18`, color: catColor[p.categorieIA], fontWeight: 600 }}>
                            {catIcon[p.categorieIA]} {p.categorieIA}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                            <div style={{ height: '100%', width: `${p.scoreIA || 0}%`, background: catColor[p.categorieIA], borderRadius: 100, transition: 'width 0.8s' }} />
                          </div>
                          <span style={{ fontSize: 12, color: catColor[p.categorieIA], fontWeight: 600, minWidth: 35 }}>{p.scoreIA || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {prospects.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Aucun prospect</div>
                )}
              </div>
            )}
          </div>

          {/* Suggestions IA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>Suggestions IA</h2>

              {chauds.slice(0, 2).map(p => (
                <div key={p.id} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🔥</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>Opportunité à haut potentiel</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(240,236,228,0.6)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {p.nomClient} a un score de {p.scoreIA}%. Contactez-le maintenant !
                  </p>
                  <button style={{ width: '100%', padding: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, color: '#f59e0b', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                    Appeler {p.nomClient?.split(' ')[0]}
                  </button>
                </div>
              ))}

              {tièdes.slice(0, 1).map(p => (
                <div key={p.id} style={{ background: 'rgba(99,157,255,0.06)', border: '1px solid rgba(99,157,255,0.15)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#639dff', fontWeight: 600 }}>🌤️ Suivi nécessaire</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(240,236,228,0.6)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {p.nomClient} est tiède depuis quelque temps. Envoyez une étude personnalisée.
                  </p>
                  <button style={{ width: '100%', padding: '8px', background: 'rgba(99,157,255,0.1)', border: '1px solid rgba(99,157,255,0.2)', borderRadius: 6, color: '#639dff', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    Envoyer Étude
                  </button>
                </div>
              ))}

              {prospects.length === 0 && (
                <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)', textAlign: 'center' }}>Aucune suggestion disponible</p>
              )}
            </div>

            {/* Detail prospect sélectionné */}
            {selected && (
              <div style={{ background: '#0b1825', borderRadius: 12, border: `1px solid ${catColor[selected.categorieIA]}30`, padding: 24 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: '#f0ece4', margin: '0 0 16px' }}>
                  Détail — {selected.nomClient}
                </h3>
                {[
                  { label: 'Email', value: selected.emailClient },
                  { label: 'Localisation', value: selected.localisation || '—' },
                  { label: 'Budget', value: selected.budget ? `${selected.budget.toLocaleString()} DH` : '—' },
                  { label: 'Statut', value: selected.statut },
                  { label: 'Score IA', value: `${selected.scoreIA || 0} / 100` },
                  { label: 'Catégorie', value: `${catIcon[selected.categorieIA]} ${selected.categorieIA}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: '#f0ece4', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}