'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Prospect {
  id: number; nomClient: string; emailClient: string;
  budget: number; localisation: string; statut: string;
  scoreIA: number; categorieIA: string; nomAgent: string;
}

const STATUTS = ['NOUVEAU', 'CONTACTE', 'INTERESSE', 'EN_NEGOCIATION', 'CONVERTI', 'PERDU'];
const statutColors: Record<string, string> = {
  NOUVEAU: '#639dff', CONTACTE: '#f59e0b', INTERESSE: '#34d399',
  EN_NEGOCIATION: '#a78bfa', CONVERTI: '#10b981', PERDU: '#f87171'
};
const categorieColors: Record<string, string> = { CHAUD: '#f59e0b', TIEDE: '#639dff', FROID: '#94a3b8' };

export default function Prospects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => {
    api.get('/api/prospects').then(r => setProspects(r.data))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = prospects.filter(p => {
    const matchSearch = !search || p.nomClient?.toLowerCase().includes(search.toLowerCase()) || p.localisation?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.categorieIA === filterCat;
    return matchSearch && matchCat;
  });

  const byStatut = (statut: string) => filtered.filter(p => p.statut === statut);

  const handleStatutChange = async (id: number, statut: string) => {
    try {
      await api.patch(`/api/prospects/${id}/statut?statut=${statut}`);
      setProspects(prev => prev.map(p => p.id === id ? { ...p, statut } : p));
    } catch (e) { console.error(e); }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>CRM</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Pipeline de Vente</h1>
            <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>Suivi en temps réel de vos opportunités</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
              style={{ padding: '10px 16px', background: '#0b1825', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none', width: 200 }} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding: '10px 16px', background: '#0b1825', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none' }}>
              <option value="">Toutes catégories</option>
              <option value="CHAUD">🔥 Chaud</option>
              <option value="TIEDE">🌤️ Tiède</option>
              <option value="FROID">❄️ Froid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, padding: 40, textAlign: 'center' }}>Chargement...</div>
        ) : (
          /* Kanban */
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
            {STATUTS.map(statut => {
              const items = byStatut(statut);
              return (
                <div key={statut} style={{ minWidth: 260, flex: '0 0 260px' }}>
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '8px 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statutColors[statut] }} />
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,236,228,0.7)' }}>{statut.replace('_', ' ')}</span>
                    </div>
                    <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 100, color: 'rgba(240,236,228,0.5)' }}>{items.length}</span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(p => (
                      <div key={p.id} style={{
                        background: '#0b1825', borderRadius: 10, padding: 16,
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `3px solid ${statutColors[statut]}`,
                        transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                      >
                        {/* Category badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 100, background: `${categorieColors[p.categorieIA]}18`, color: categorieColors[p.categorieIA] || '#639dff' }}>
                            {p.categorieIA === 'CHAUD' ? '🔥' : p.categorieIA === 'TIEDE' ? '🌤️' : '❄️'} {p.categorieIA}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>#{p.id}</span>
                        </div>

                        {/* Name */}
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ece4', marginBottom: 4 }}>{p.nomClient || 'Client'}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', marginBottom: 10 }}>{p.emailClient}</div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                          {p.localisation && <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.5)' }}>📍 {p.localisation}</div>}
                          {p.budget && <div style={{ fontSize: 12, color: '#639dff', fontWeight: 500 }}>💰 {p.budget.toLocaleString()} DH</div>}
                        </div>

                        {/* Score bar */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score IA</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: categorieColors[p.categorieIA] || '#639dff' }}>{p.scoreIA || 0}%</span>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                            <div style={{ height: '100%', width: `${p.scoreIA || 0}%`, background: categorieColors[p.categorieIA] || '#639dff', borderRadius: 100 }} />
                          </div>
                        </div>

                        {/* Change statut */}
                        <select value={p.statut} onChange={e => handleStatutChange(p.id, e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: 'rgba(240,236,228,0.7)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, outline: 'none', cursor: 'pointer' }}>
                          {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div style={{ padding: 20, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center', color: 'rgba(240,236,228,0.2)', fontSize: 12 }}>
                        Aucun prospect
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}