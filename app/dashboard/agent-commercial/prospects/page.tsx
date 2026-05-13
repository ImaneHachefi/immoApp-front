'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Search, MapPin, TrendingUp, Flame, Snowflake, Cloud } from 'lucide-react';

interface Prospect {
  id: number; nomClient: string; emailClient: string;
  budget: number; localisation: string; statut: string;
  scoreIA: number; categorieIA: string; nomAgent: string;
}

const STATUTS = ['NOUVEAU', 'CONTACTE', 'INTERESSE', 'EN_NEGOCIATION', 'CONVERTI', 'PERDU'];
const statutColors: Record<string, string> = {
  NOUVEAU: '#3b82f6', CONTACTE: '#f59e0b', INTERESSE: '#34d399',
  EN_NEGOCIATION: '#a78bfa', CONVERTI: '#10b981', PERDU: '#f87171'
};
const categorieColors: Record<string, string> = { CHAUD: '#f59e0b', TIEDE: '#3b82f6', FROID: '#94a3b8' };
const categorieIcons: Record<string, React.ReactNode> = {
  CHAUD: <Flame className="w-3 h-3" />, TIEDE: <Cloud className="w-3 h-3" />, FROID: <Snowflake className="w-3 h-3" />
};

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
      <div className="max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-7">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">CRM</div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Pipeline de Vente</h1>
            <p className="text-muted-foreground text-sm mt-1">Suivi en temps réel de vos opportunités</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="pl-9 pr-4 py-2.5 bg-surface border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary transition-all w-48 placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-3.5 py-2.5 bg-surface border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary cursor-pointer">
              <option value="">Toutes catégories</option>
              <option value="CHAUD">Chaud</option>
              <option value="TIEDE">Tiède</option>
              <option value="FROID">Froid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Chargement...</div>
        ) : (
          /* Kanban */
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
            {STATUTS.map(statut => {
              const items = byStatut(statut);
              return (
                <div key={statut} className="min-w-[260px] flex-[0_0_260px]">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: statutColors[statut] }} />
                      <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{statut.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">{items.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2.5">
                    {items.map(p => (
                      <div key={p.id} className="bg-surface rounded-xl p-4 border border-surface-border hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
                        style={{ borderLeftWidth: 3, borderLeftColor: statutColors[statut] }}
                      >
                        {/* Category badge */}
                        <div className="flex justify-between items-center mb-2.5">
                          <span
                            className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: `${categorieColors[p.categorieIA]}15`, color: categorieColors[p.categorieIA] || '#3b82f6' }}
                          >
                            {categorieIcons[p.categorieIA]} {p.categorieIA}
                          </span>
                          <span className="text-xs text-muted-foreground/50">#{p.id}</span>
                        </div>

                        {/* Name */}
                        <div className="text-sm font-semibold text-foreground mb-0.5">{p.nomClient || 'Client'}</div>
                        <div className="text-xs text-muted-foreground mb-2.5">{p.emailClient}</div>

                        {/* Details */}
                        <div className="flex flex-col gap-1 mb-3">
                          {p.localisation && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.localisation}</div>}
                          {p.budget > 0 && <div className="text-xs text-primary font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {p.budget.toLocaleString()} DH</div>}
                        </div>

                        {/* Score bar */}
                        <div className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Score IA</span>
                            <span className="text-xs font-semibold" style={{ color: categorieColors[p.categorieIA] || '#3b82f6' }}>{p.scoreIA || 0}%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${p.scoreIA || 0}%`, background: categorieColors[p.categorieIA] || '#3b82f6' }} />
                          </div>
                        </div>

                        {/* Change statut */}
                        <select value={p.statut} onChange={e => handleStatutChange(p.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-muted border border-surface-border rounded-md text-foreground text-xs outline-none cursor-pointer focus:border-primary transition-colors">
                          {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="p-5 rounded-xl border border-dashed border-surface-border text-center text-muted-foreground/40 text-xs">
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