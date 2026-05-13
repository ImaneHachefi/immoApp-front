'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Users, BarChart3, TrendingUp, Bot, Flame, Cloud, Snowflake, Phone, Send, MapPin } from 'lucide-react';

interface Prospect { id: number; nomClient: string; emailClient: string; budget: number; localisation: string; statut: string; scoreIA: number; categorieIA: string; }

const catColor: Record<string, string> = { CHAUD: '#f59e0b', TIEDE: '#3b82f6', FROID: '#94a3b8' };
const catIcons: Record<string, React.ReactNode> = { CHAUD: <Flame className="w-3 h-3" />, TIEDE: <Cloud className="w-3 h-3" />, FROID: <Snowflake className="w-3 h-3" /> };

export default function QualificationIA() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prospect | null>(null);

  useEffect(() => {
    api.get('/api/prospects').then(r => setProspects(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chauds = prospects.filter(p => p.categorieIA === 'CHAUD');
  const tiedes = prospects.filter(p => p.categorieIA === 'TIEDE');
  const avgScore = prospects.length > 0 ? Math.round(prospects.reduce((a, p) => a + (p.scoreIA || 0), 0) / prospects.length) : 0;
  const converted = prospects.filter(p => p.statut === 'CONVERTI').length;
  const convRate = prospects.length > 0 ? Math.round((converted / prospects.length) * 100) : 0;

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Intelligence Artificielle</div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Qualification des Prospects</h1>
          <p className="text-muted-foreground text-sm mt-1">Analyse prédictive des opportunités de vente par l&apos;IA</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Prospects', value: prospects.length, icon: <Users className="w-5 h-5" />, color: '#3b82f6' },
            { label: 'Score Moyen', value: `${avgScore}%`, icon: <BarChart3 className="w-5 h-5" />, color: '#a78bfa', sub: '+2.7% amélioration' },
            { label: 'Taux Conversion', value: `${convRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981' },
            { label: 'Opportunités IA', value: chauds.length, icon: <Bot className="w-5 h-5" />, color: '#f59e0b', sub: `${chauds.length} action${chauds.length > 1 ? 's' : ''} requise${chauds.length > 1 ? 's' : ''}` },
          ].map((k, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 border border-surface-border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
                {k.sub && <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">{k.sub}</span>}
              </div>
              <div className="font-display text-3xl font-light mb-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          {/* Prospects list */}
          <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="font-display text-xl font-medium text-foreground">Prospects Prioritaires</h2>
            </div>
            {loading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Chargement...</div>
            ) : (
              <div>
                {[...prospects].sort((a, b) => (b.scoreIA || 0) - (a.scoreIA || 0)).map(p => (
                  <button key={p.id} onClick={() => setSelected(p)} className={`w-full text-left px-5 py-4 border-b border-surface-border/50 cursor-pointer transition-colors ${selected?.id === p.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${catColor[p.categorieIA]}20`, border: `2px solid ${catColor[p.categorieIA]}`, color: catColor[p.categorieIA] }}>
                        {p.nomClient?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-foreground truncate">{p.nomClient || 'Client'}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0" style={{ background: `${catColor[p.categorieIA]}15`, color: catColor[p.categorieIA] }}>
                            {catIcons[p.categorieIA]} {p.categorieIA}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.scoreIA || 0}%`, background: catColor[p.categorieIA] }} />
                          </div>
                          <span className="text-xs font-semibold min-w-[35px] text-right" style={{ color: catColor[p.categorieIA] }}>{p.scoreIA || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {prospects.length === 0 && <div className="p-10 text-center text-muted-foreground text-sm">Aucun prospect</div>}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Suggestions IA */}
            <div className="bg-surface rounded-xl border border-surface-border p-5 shadow-sm">
              <h2 className="font-display text-xl font-medium text-foreground mb-4">Suggestions IA</h2>

              {chauds.slice(0, 2).map(p => (
                <div key={p.id} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-500">Opportunité à haut potentiel</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.nomClient} a un score de {p.scoreIA}%. Contactez-le maintenant !</p>
                  <button className="w-full py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 text-xs font-medium cursor-pointer hover:bg-amber-500/15 transition-colors flex items-center justify-center gap-1.5">
                    <Phone className="w-3 h-3" /> Appeler {p.nomClient?.split(' ')[0]}
                  </button>
                </div>
              ))}

              {tiedes.slice(0, 1).map(p => (
                <div key={p.id} className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-500">Suivi nécessaire</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.nomClient} est tiède depuis quelque temps. Envoyez une étude personnalisée.</p>
                  <button className="w-full py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 text-xs font-medium cursor-pointer hover:bg-blue-500/15 transition-colors flex items-center justify-center gap-1.5">
                    <Send className="w-3 h-3" /> Envoyer Étude
                  </button>
                </div>
              ))}

              {prospects.length === 0 && <p className="text-sm text-muted-foreground text-center">Aucune suggestion disponible</p>}
            </div>

            {/* Detail */}
            {selected && (
              <div className="bg-surface rounded-xl border border-surface-border p-5 shadow-sm" style={{ borderColor: `${catColor[selected.categorieIA]}30` }}>
                <h3 className="font-display text-lg font-medium text-foreground mb-4">Détail — {selected.nomClient}</h3>
                {[
                  { label: 'Email', value: selected.emailClient },
                  { label: 'Localisation', value: selected.localisation || '—' },
                  { label: 'Budget', value: selected.budget ? `${selected.budget.toLocaleString()} DH` : '—' },
                  { label: 'Statut', value: selected.statut },
                  { label: 'Score IA', value: `${selected.scoreIA || 0} / 100` },
                  { label: 'Catégorie', value: selected.categorieIA },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-surface-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm text-foreground font-medium">{row.value}</span>
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