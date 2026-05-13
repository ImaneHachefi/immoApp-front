'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { FolderOpen, Settings2, CheckCircle, Lock, AlertTriangle, Zap, Info, MoreVertical, Send, MessageSquare } from 'lucide-react';

interface Ticket {
  id: number; sujet: string; description: string; statut: string; priorite: string;
  dateCreation: string; dateResolution: string | null; nomClient: string;
  nomAgent: string | null; messages: any[];
}

const statutConfig: Record<string, { label: string; color: string; bg: string }> = {
  OUVERT:   { label: 'Nouveau',     color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  EN_COURS: { label: 'En cours',    color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  RESOLU:   { label: 'Résolu',      color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  FERME:    { label: 'En attente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
};

const prioriteConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  HAUTE:   { label: 'CRITIQUE', color: '#f87171', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  MOYENNE: { label: 'MOYENNE',  color: '#f59e0b', icon: <Zap className="w-3.5 h-3.5" /> },
  BASSE:   { label: 'BASSE',    color: '#60a5fa', icon: <Info className="w-3.5 h-3.5" /> },
};

export default function TicketsSAV() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const load = () => {
    api.get('/api/tickets').then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const loadMessages = (ticketId: number) => {
    api.get(`/api/tickets/${ticketId}/messages`).then(r => setMessages(r.data)).catch(() => setMessages([]));
  };

  const selectTicket = (t: Ticket) => { setSelected(t); loadMessages(t.id); };

  const handleStatut = async (id: number, statut: string) => {
    try {
      await api.patch(`/api/tickets/${id}/statut?statut=${statut}`);
      load();
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, statut } : null);
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    setSending(true);
    try {
      await api.post('/api/tickets/messages', { ticketId: selected.id, contenu: message, expediteur: 'AGENT_SAV', estBot: false });
      setMessage('');
      loadMessages(selected.id);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const filtered = tickets.filter(t => !filterStatut || t.statut === filterStatut);

  const stats = {
    ouverts: tickets.filter(t => t.statut === 'OUVERT').length,
    enCours: tickets.filter(t => t.statut === 'EN_COURS').length,
    resolus: tickets.filter(t => t.statut === 'RESOLU').length,
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_SAV']}>
      <div className="max-w-[1300px]">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Support</div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Tableau de Bord Support</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez et suivez les demandes d'assistance en temps réel.</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            { label: 'Tickets Ouverts', value: stats.ouverts || 24, trend: '+5% ce mois', trendUp: true, color: '#60a5fa', iconBg: 'rgba(96,165,250,0.12)', icon: <FolderOpen className="w-5 h-5 text-blue-500" /> },
            { label: 'En Attente',       value: stats.enCours || 12, trend: '-2% ce mois', trendUp: false, color: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)', icon: <Settings2 className="w-5 h-5 text-amber-500" /> },
            { label: 'Résolus',          value: stats.resolus || 158, trend: '+12% ce mois', trendUp: true, color: '#34d399', iconBg: 'rgba(52,211,153,0.12)', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
            { label: 'SLA Respecté',     value: '98.2%', trend: 'Objectif atteint', trendUp: true, color: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', icon: <Lock className="w-5 h-5 text-purple-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 border border-surface-border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.iconBg }}>{s.icon}</div>
              </div>
              <div className="font-display text-3xl font-bold mb-1.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-semibold flex items-center gap-1" style={{ color: s.trendUp ? '#34d399' : '#f87171' }}>
                <span>{s.trendUp ? '↑' : '↘'}</span>
                <span>{s.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-2.5 mb-6 flex-wrap">
          <button className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filterStatut === '' ? 'bg-primary text-primary-foreground' : 'bg-surface border border-surface-border text-muted-foreground hover:text-foreground'}`} onClick={() => setFilterStatut('')}>Tous les tickets</button>
          <button className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${filterStatut === 'HAUTE' ? 'bg-primary text-primary-foreground' : 'bg-surface border border-surface-border text-muted-foreground hover:text-foreground'}`} onClick={() => setFilterStatut('HAUTE')}>
            Priorité Haute <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          </button>
          <button className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filterStatut === 'AGENT' ? 'bg-primary text-primary-foreground' : 'bg-surface border border-surface-border text-muted-foreground hover:text-foreground'}`} onClick={() => setFilterStatut('AGENT')}>Assignés à moi</button>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
          {/* Ticket list */}
          <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-surface-border">
              <h3 className="font-display text-lg font-medium text-foreground">Liste des demandes</h3>
            </div>

            {loading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Aucun ticket</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['ID Ticket', 'Sujet & Client', 'Statut', 'Priorité', 'Assigné', 'Mise à jour', ''].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground border-b border-surface-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => {
                      const sc = statutConfig[t.statut] ?? { label: t.statut, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                      const pc = prioriteConfig[t.priorite] ?? { label: t.priorite, color: '#94a3b8', icon: <Info className="w-3.5 h-3.5"/> };
                      const initials = t.nomAgent ? t.nomAgent.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : null;
                      return (
                        <tr key={t.id} className={`cursor-pointer transition-colors border-b border-surface-border/50 ${selected?.id === t.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => selectTicket(t)}>
                          <td className="px-5 py-3.5"><span className="text-xs text-muted-foreground">#{String(t.id).padStart(4, '0')}</span></td>
                          <td className="px-5 py-3.5">
                            <div className="text-sm font-medium text-foreground mb-0.5">{t.sujet}</div>
                            <div className="text-xs text-muted-foreground">{t.nomClient || 'Client'}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: pc.color }}>
                              {pc.icon} {pc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {initials ? (
                              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">{initials}</div>
                                {t.nomAgent}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Non assigné</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail + Messages */}
          {selected ? (
            <div className="bg-surface border border-surface-border rounded-xl flex flex-col overflow-hidden h-[600px] shadow-sm">
              <div className="px-5 py-4 border-b border-surface-border">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-display text-lg font-medium text-foreground">{selected.sujet}</h3>
                  <select
                    value={selected.statut}
                    onChange={e => handleStatut(selected.id, e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-muted border border-surface-border rounded-lg outline-none cursor-pointer"
                    style={{ color: statutConfig[selected.statut]?.color ?? 'inherit' }}
                  >
                    {['OUVERT','EN_COURS','RESOLU','FERME'].map(s => (
                      <option key={s} value={s}>{statutConfig[s]?.label ?? s}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{selected.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">👤 {selected.nomClient || 'Client'}</span>
                  {selected.nomAgent && <span className="flex items-center gap-1.5">🔧 {selected.nomAgent}</span>}
                  {selected.dateCreation && <span className="opacity-75">{new Date(selected.dateCreation).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun message</p>
                  </div>
                ) : messages.map((m: any, i: number) => {
                  const isAgent = m.expediteur === 'AGENT_SAV';
                  const isBot = m.estBot;
                  return (
                    <div key={i} className={`max-w-[85%] px-4 py-2.5 rounded-xl ${
                      isAgent 
                        ? 'self-end bg-primary/10 border border-primary/20 text-foreground' 
                        : isBot 
                          ? 'self-start bg-purple-500/10 border border-purple-500/20 text-foreground' 
                          : 'self-start bg-muted border border-surface-border text-foreground'
                    }`}>
                      <div className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">{isBot ? '🤖 BOT' : m.expediteur}</div>
                      <div className="text-sm leading-relaxed">{m.contenu}</div>
                    </div>
                  );
                })}
              </div>

              {/* Send */}
              <form className="px-4 py-3 border-t border-surface-border flex gap-2" onSubmit={handleSendMessage}>
                <input
                  className="flex-1 px-4 py-2.5 bg-muted border border-surface-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Écrire un message..."
                />
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-default flex items-center justify-center" type="submit" disabled={sending || !message.trim()}>
                  {sending ? '...' : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-surface border border-surface-border rounded-xl flex flex-col items-center justify-center h-[600px] shadow-sm">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground text-center">← Sélectionnez un ticket<br />pour voir les détails</p>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}