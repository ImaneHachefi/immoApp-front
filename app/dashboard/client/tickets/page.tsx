'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Ticket, Plus, Send, FolderOpen, Settings2, CheckCircle, Lock, X, Calendar, UserCircle } from 'lucide-react';

interface TicketItem { id: number; sujet: string; description: string; statut: string; priorite: string; dateCreation: string; dateResolution: string | null; nomAgent: string | null }

const statutColors: Record<string, string> = { OUVERT: '#d4a017', EN_COURS: '#2563eb', RESOLU: '#10b981', FERME: '#94a3b8' };
const statutIcons: Record<string, React.ReactNode> = {
  OUVERT: <FolderOpen className="w-3 h-3" />,
  EN_COURS: <Settings2 className="w-3 h-3" />,
  RESOLU: <CheckCircle className="w-3 h-3" />,
  FERME: <Lock className="w-3 h-3" />,
};

export default function MesTickets() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sujet: '', description: '', priorite: 'MOYENNE' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TicketItem | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const getClientId = async () => {
    try { const r = await api.get('/api/auth/me'); return r.data.id; }
    catch { return null; }
  };

  const load = async () => {
    const id = await getClientId();
    if (id) {
      api.get(`/api/tickets/client/${id}`).then(r => setTickets(r.data)).catch(() => setTickets([])).finally(() => setLoading(false));
    } else { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadMessages = (ticketId: number) => {
    api.get(`/api/tickets/${ticketId}/messages`).then(r => setMessages(r.data)).catch(() => setMessages([]));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const id = await getClientId();
      await api.post('/api/tickets', { ...form, clientId: id });
      setShowModal(false); setForm({ sujet: '', description: '', priorite: 'MOYENNE' }); load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    setSending(true);
    try {
      await api.post('/api/tickets/messages', { ticketId: selected.id, contenu: message, expediteur: 'CLIENT', estBot: false });
      setMessage(''); loadMessages(selected.id);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Support</div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Mes Tickets SAV</h1>
            <p className="text-muted-foreground text-sm mt-1">Suivez vos demandes d&apos;assistance</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm font-medium flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-sm">
            <Plus className="w-4 h-4" />
            Nouveau Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
          {/* List */}
          <div>
            {loading ? (
              <div className="text-center py-16 text-muted-foreground text-sm">Chargement...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-surface-border">
                <Ticket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Aucun ticket pour le moment</p>
                <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary cursor-pointer hover:bg-primary/15 transition-colors text-sm font-medium">
                  Créer mon premier ticket
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tickets.map(t => (
                  <button key={t.id} onClick={() => { setSelected(t); loadMessages(t.id); }}
                    className={`w-full text-left bg-surface rounded-xl px-5 py-4 border transition-all cursor-pointer hover:translate-x-1 ${
                      selected?.id === t.id ? 'border-primary/30 shadow-sm' : 'border-surface-border hover:border-surface-border'
                    }`}
                    style={{ borderLeftWidth: 4, borderLeftColor: statutColors[t.statut] }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-muted-foreground mr-2">#{t.id}</span>
                        <span className="text-sm font-medium text-foreground">{t.sujet}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: `${statutColors[t.statut]}18`, color: statutColors[t.statut] }}
                      >
                        {statutIcons[t.statut]} {t.statut}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2">{t.description}</p>}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR') : ''}
                      </span>
                      {t.nomAgent ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><UserCircle className="w-3 h-3" /> Agent : {t.nomAgent}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">En attente d&apos;assignation</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conversation */}
          {selected ? (
            <div className="bg-surface rounded-xl border border-surface-border flex flex-col overflow-hidden max-h-[580px] shadow-sm">
              <div className="px-5 py-4 border-b border-surface-border">
                <h3 className="font-display text-base font-medium text-foreground mb-1">{selected.sujet}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${statutColors[selected.statut]}18`, color: statutColors[selected.statut] }}>{selected.statut}</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-10">Aucun message pour ce ticket</p>
                ) : messages.map((m: any, i: number) => (
                  <div key={i} className={`flex ${m.expediteur === 'CLIENT' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm ${
                      m.expediteur === 'CLIENT'
                        ? 'bg-primary/10 border border-primary/20 text-foreground'
                        : m.estBot
                          ? 'bg-purple-500/10 border border-purple-500/15 text-foreground'
                          : 'bg-muted border border-surface-border text-foreground'
                    }`}>
                      <div className="text-[10px] text-muted-foreground mb-1">{m.estBot ? '🤖 BOT' : m.expediteur}</div>
                      <div className="leading-relaxed">{m.contenu}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selected.statut !== 'FERME' && selected.statut !== 'RESOLU' && (
                <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-surface-border flex gap-2">
                  <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Votre message..."
                    className="flex-1 px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50" />
                  <button type="submit" disabled={sending || !message.trim()}
                    className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-default">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-surface-border flex items-center justify-center min-h-[300px]">
              <p className="text-muted-foreground text-sm text-center">← Sélectionnez un ticket<br />pour voir la conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-surface rounded-2xl p-8 w-[460px] max-w-[90vw] border border-surface-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-medium text-foreground">Nouveau ticket</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Sujet</label>
                <input type="text" placeholder="Décrivez votre problème brièvement" value={form.sujet} onChange={e => setForm({ ...form, sujet: e.target.value })} required
                  className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Donnez plus de détails..."
                  className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-y placeholder:text-muted-foreground/50" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Priorité</label>
                <select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary cursor-pointer">
                  <option value="BASSE">🟢 Basse</option>
                  <option value="MOYENNE">🟡 Moyenne</option>
                  <option value="HAUTE">🔴 Haute</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground cursor-pointer hover:bg-muted/80 transition-colors text-sm font-medium">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:brightness-110 transition-all text-sm font-medium">
                  {saving ? 'Envoi...' : 'Créer le ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}