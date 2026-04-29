'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Ticket { id: number; sujet: string; description: string; statut: string; priorite: string; dateCreation: string; dateResolution: string | null; nomAgent: string | null }

const statutColors: Record<string, string> = { OUVERT: '#f59e0b', EN_COURS: '#639dff', RESOLU: '#34d399', FERME: '#94a3b8' };
const statutIcons: Record<string, string> = { OUVERT: '📂', EN_COURS: '⚙️', RESOLU: '✅', FERME: '🔒' };

export default function MesTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sujet: '', description: '', priorite: 'MOYENNE' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Support</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Mes Tickets SAV</h1>
            <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>Suivez vos demandes d'assistance</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500 }}>
            + Nouveau Ticket
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 }}>
          {/* Liste */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Chargement...</div>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
                <p style={{ color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Aucun ticket pour le moment</p>
                <button onClick={() => setShowModal(true)} style={{ marginTop: 16, padding: '10px 20px', background: 'rgba(99,157,255,0.1)', border: '1px solid rgba(99,157,255,0.2)', borderRadius: 8, color: '#639dff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                  Créer mon premier ticket
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tickets.map(t => (
                  <div key={t.id} onClick={() => { setSelected(t); loadMessages(t.id); }} style={{
                    background: '#0b1825', borderRadius: 12, padding: '18px 20px',
                    border: selected?.id === t.id ? '1px solid rgba(99,157,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    borderLeft: `4px solid ${statutColors[t.statut]}`,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)', marginRight: 8 }}>#{t.id}</span>
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#f0ece4' }}>{t.sujet}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: `${statutColors[t.statut]}18`, color: statutColors[t.statut], fontWeight: 700 }}>
                          {statutIcons[t.statut]} {t.statut}
                        </span>
                      </div>
                    </div>
                    {t.description && <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.45)', margin: '0 0 10px', lineHeight: 1.5 }}>{t.description.slice(0, 100)}{t.description.length > 100 ? '...' : ''}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)' }}>
                        📅 {t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR') : ''}
                      </span>
                      {t.nomAgent ? (
                        <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>👤 Agent : {t.nomAgent}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.2)' }}>En attente d'assignation</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation */}
          {selected ? (
            <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 580 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: '#f0ece4', margin: '0 0 4px' }}>{selected.sujet}</h3>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${statutColors[selected.statut]}18`, color: statutColors[selected.statut] }}>{selected.statut}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'rgba(240,236,228,0.3)', fontSize: 13, padding: 20 }}>Aucun message pour ce ticket</p>
                ) : messages.map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.expediteur === 'CLIENT' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px', borderRadius: 10,
                      background: m.expediteur === 'CLIENT' ? 'rgba(59,130,246,0.2)' : m.estBot ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: 10, color: 'rgba(240,236,228,0.4)', marginBottom: 4 }}>
                        {m.estBot ? '🤖 BOT' : m.expediteur}
                      </div>
                      <div style={{ fontSize: 13, color: '#f0ece4', lineHeight: 1.5 }}>{m.contenu}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selected.statut !== 'FERME' && selected.statut !== 'RESOLU' && (
                <form onSubmit={handleSendMessage} style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                  <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Votre message..."
                    style={{ flex: 1, padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none' }} />
                  <button type="submit" disabled={sending || !message.trim()} style={{ padding: '9px 16px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14 }}>➤</button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'rgba(240,236,228,0.3)', fontSize: 14, textAlign: 'center' }}>← Sélectionnez un ticket<br />pour voir la conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau ticket */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0b1825', borderRadius: 16, padding: 32, width: 460, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: '#f0ece4', margin: '0 0 24px' }}>Nouveau ticket</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sujet</label>
                <input type="text" placeholder="Décrivez votre problème brièvement" value={form.sujet} onChange={e => setForm({ ...form, sujet: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Donnez plus de détails..."
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priorité</label>
                <select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#060e18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }}>
                  <option value="BASSE">🟢 Basse</option>
                  <option value="MOYENNE">🟡 Moyenne</option>
                  <option value="HAUTE">🔴 Haute</option>
                </select>
              </div>
              {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
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