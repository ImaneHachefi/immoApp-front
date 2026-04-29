'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

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

const prioriteConfig: Record<string, { label: string; color: string; icon: string }> = {
  HAUTE:   { label: 'CRITIQUE', color: '#f87171', icon: '!' },
  MOYENNE: { label: 'MOYENNE',  color: '#f59e0b', icon: '⚡' },
  BASSE:   { label: 'BASSE',    color: '#60a5fa', icon: 'ℹ' },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .sav-root {
          font-family: 'Inter', sans-serif;
          background: #0d1117;
          min-height: 100vh;
          color: #e6edf3;
        }

        /* ── Top Nav ── */
        .nav {
          display: flex; align-items: center; gap: 0;
          padding: 0 32px;
          background: #161b22;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          height: 56px;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          margin-right: 32px;
        }
        .nav-logo-icon {
          width: 28px; height: 28px;
          background: #2563eb;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .nav-logo-name {
          font-weight: 700; font-size: 15px; color: #e6edf3;
        }
        .nav-links { display: flex; gap: 2px; flex: 1; }
        .nav-link {
          padding: 6px 14px; border-radius: 6px; font-size: 14px;
          color: rgba(230,237,243,0.6); cursor: pointer;
          background: transparent; border: none;
          transition: all 0.15s;
        }
        .nav-link:hover { color: #e6edf3; background: rgba(255,255,255,0.05); }
        .nav-link.active {
          color: #e6edf3; background: rgba(37,99,235,0.2);
          border-bottom: 2px solid #2563eb;
          border-radius: 6px 6px 0 0;
        }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-search {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 6px 12px;
          font-size: 13px; color: rgba(230,237,243,0.5);
          min-width: 220px;
        }
        .nav-icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; color: rgba(230,237,243,0.7);
        }
        .nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }

        /* ── Page body ── */
        .page { padding: 32px; max-width: 1300px; margin: 0 auto; }

        /* ── Page header ── */
        .page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 28px;
        }
        .page-title { font-size: 26px; font-weight: 700; color: #e6edf3; margin: 0 0 4px; }
        .page-subtitle { font-size: 13px; color: rgba(230,237,243,0.5); margin: 0; }
        .btn-new {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: #2563eb; color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-new:hover { background: #1d4ed8; }

        /* ── Stat cards ── */
        .stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #161b22;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 20px 22px;
        }
        .stat-card-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 12px;
        }
        .stat-card-label { font-size: 12px; color: rgba(230,237,243,0.5); font-weight: 500; }
        .stat-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .stat-value { font-size: 30px; font-weight: 700; margin: 0 0 6px; }
        .stat-trend { font-size: 12px; display: flex; align-items: center; gap: 4px; }

        /* ── Filters ── */
        .filters { display: flex; gap: 10px; margin-bottom: 20px; }
        .filter-btn {
          padding: 7px 16px; border-radius: 8px; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(230,237,243,0.6);
          background: rgba(255,255,255,0.04);
          transition: all 0.15s;
        }
        .filter-btn:hover { background: rgba(255,255,255,0.08); color: #e6edf3; }
        .filter-btn.active {
          background: #2563eb; color: #fff; border-color: #2563eb;
        }
        .filter-dot {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%; background: #f87171;
          margin-left: 4px; vertical-align: middle;
        }

        /* ── Main grid ── */
        .main-grid { display: grid; grid-template-columns: 1fr 420px; gap: 16px; }

        /* ── Ticket list card ── */
        .card {
          background: #161b22;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; overflow: hidden;
        }
        .card-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .card-title { font-size: 15px; font-weight: 600; color: #e6edf3; margin: 0; }

        /* ── Table ── */
        .tickets-table { width: 100%; border-collapse: collapse; }
        .tickets-table th {
          padding: 10px 20px; text-align: left;
          font-size: 11px; font-weight: 600;
          color: rgba(230,237,243,0.4);
          text-transform: uppercase; letter-spacing: 0.06em;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .tickets-table td {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
        }
        .ticket-row {
          cursor: pointer; transition: background 0.15s;
        }
        .ticket-row:hover { background: rgba(255,255,255,0.03); }
        .ticket-row.selected { background: rgba(37,99,235,0.08); }
        .ticket-id { color: rgba(230,237,243,0.4); font-size: 12px; }
        .ticket-subject { font-weight: 600; color: #e6edf3; margin-bottom: 2px; }
        .ticket-client { font-size: 12px; color: rgba(230,237,243,0.45); }

        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 6px;
          font-size: 11px; font-weight: 600;
        }
        .priorite-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600;
        }
        .assignee {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: rgba(230,237,243,0.7);
        }
        .assignee-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: #fff; flex-shrink: 0;
        }
        .time-cell { font-size: 12px; color: rgba(230,237,243,0.4); }
        .action-btn {
          background: none; border: none; color: rgba(230,237,243,0.4);
          cursor: pointer; font-size: 18px; padding: 4px 6px; border-radius: 4px;
        }
        .action-btn:hover { background: rgba(255,255,255,0.07); color: #e6edf3; }

        /* ── Pagination ── */
        .pagination {
          padding: 14px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .pagination-info { font-size: 12px; color: rgba(230,237,243,0.4); }
        .pagination-btns { display: flex; gap: 4px; align-items: center; }
        .page-btn {
          width: 30px; height: 30px; border-radius: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(230,237,243,0.6); font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .page-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }

        /* ── Detail panel ── */
        .detail-panel {
          background: #161b22;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          display: flex; flex-direction: column;
          overflow: hidden; max-height: 640px;
        }
        .detail-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .detail-subject {
          font-size: 15px; font-weight: 600; color: #e6edf3;
          margin: 0 0 6px;
        }
        .detail-desc {
          font-size: 12px; color: rgba(230,237,243,0.5); margin: 0 0 10px;
        }
        .detail-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .statut-select {
          padding: 5px 10px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; color: #e6edf3;
          font-size: 12px; outline: none; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }

        /* Messages zone */
        .messages-zone {
          flex: 1; overflow-y: auto; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .msg-bubble {
          max-width: 82%; padding: 10px 14px; border-radius: 12px;
        }
        .msg-bubble.agent {
          align-self: flex-end;
          background: rgba(37,99,235,0.2);
          border: 1px solid rgba(37,99,235,0.3);
        }
        .msg-bubble.client {
          align-self: flex-start;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .msg-bubble.bot {
          align-self: flex-start;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.2);
        }
        .msg-sender { font-size: 10px; color: rgba(230,237,243,0.4); margin-bottom: 4px; }
        .msg-content { font-size: 13px; color: #e6edf3; line-height: 1.5; }

        /* Send form */
        .send-form {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex; gap: 8px;
        }
        .send-input {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; color: #e6edf3;
          font-family: 'Inter', sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.15s;
        }
        .send-input:focus { border-color: rgba(37,99,235,0.5); }
        .send-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg,#1d4ed8,#2563eb);
          border: none; border-radius: 8px;
          color: #fff; cursor: pointer;
          font-size: 14px; font-weight: 600;
          transition: opacity 0.15s;
        }
        .send-btn:disabled { opacity: 0.45; cursor: default; }

        /* Empty state */
        .empty-panel {
          background: #161b22;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-text {
          color: rgba(230,237,243,0.3); font-size: 14px;
          text-align: center; line-height: 1.8;
        }

        /* Footer */
        .footer {
          text-align: center; padding: 24px;
          font-size: 12px; color: rgba(230,237,243,0.25);
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 32px;
        }
      `}</style>

      <div className="sav-root">
        {/* ── Nav ── */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-icon">🏠</div>
            <span className="nav-logo-name">SupHouse</span>
          </div>
          <div className="nav-links">
            {['Dashboard', 'Tickets', 'Clients', 'Rapports'].map(l => (
              <button key={l} className={`nav-link${l === 'Dashboard' ? ' active' : ''}`}>{l}</button>
            ))}
          </div>
          <div className="nav-right">
            <div className="nav-search">
              <span>🔍</span>
              <span>Rechercher un ticket...</span>
            </div>
            <div className="nav-icon-btn">🔔</div>
            <div className="nav-icon-btn">⚙️</div>
            <div className="nav-avatar">A</div>
          </div>
        </nav>

        <div className="page">
          {/* ── Header ── */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Tableau de Bord Support</h1>
              <p className="page-subtitle">Gérez et suivez les demandes d'assistance en temps réel.</p>
            </div>
            
          </div>

          {/* ── Stats ── */}
          <div className="stats-grid">
            {[
              { label: 'Tickets Ouverts', value: stats.ouverts || 24, trend: '+5% ce mois', trendUp: true, color: '#60a5fa', iconBg: 'rgba(96,165,250,0.12)', icon: '📂' },
              { label: 'En Attente',       value: stats.enCours || 12, trend: '-2% ce mois', trendUp: false, color: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)', icon: '😐' },
              { label: 'Résolus',          value: stats.resolus || 158, trend: '+12% ce mois', trendUp: true, color: '#34d399', iconBg: 'rgba(52,211,153,0.12)', icon: '✅' },
              { label: 'SLA Respecté',     value: '98.2%', trend: 'Objectif atteint', trendUp: true, color: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', icon: '🎯' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-label">{s.label}</span>
                  <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                </div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-trend" style={{ color: s.trendUp ? '#34d399' : '#f87171' }}>
                  <span>{s.trendUp ? '↑' : '↘'}</span>
                  <span>{s.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="filters">
            <button className={`filter-btn${filterStatut === '' ? ' active' : ''}`} onClick={() => setFilterStatut('')}>Tous les tickets</button>
            <button className={`filter-btn${filterStatut === 'HAUTE' ? ' active' : ''}`} onClick={() => setFilterStatut('HAUTE')}>
              Priorité Haute <span className="filter-dot" />
            </button>
            <button className={`filter-btn${filterStatut === 'AGENT' ? ' active' : ''}`} onClick={() => setFilterStatut('AGENT')}>Assignés à moi</button>
            <button className={`filter-btn`}>⚙ Filtres</button>
          </div>

          {/* ── Main grid ── */}
          <div className="main-grid">
            {/* Ticket list */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Liste des demandes</h3>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(230,237,243,0.4)', fontSize: 14 }}>Chargement...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(230,237,243,0.4)', fontSize: 14 }}>Aucun ticket</div>
              ) : (
                <>
                  <table className="tickets-table">
                    <thead>
                      <tr>
                        <th>ID Ticket</th>
                        <th>Sujet &amp; Client</th>
                        <th>Statut</th>
                        <th>Priorité</th>
                        <th>Assigné</th>
                        <th>Dernière Mise à jour</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(t => {
                        const sc = statutConfig[t.statut] ?? { label: t.statut, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                        const pc = prioriteConfig[t.priorite] ?? { label: t.priorite, color: '#94a3b8', icon: '·' };
                        const initials = t.nomAgent ? t.nomAgent.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : null;
                        return (
                          <tr key={t.id} className={`ticket-row${selected?.id === t.id ? ' selected' : ''}`} onClick={() => selectTicket(t)}>
                            <td><span className="ticket-id">#{String(t.id).padStart(4, '0')}</span></td>
                            <td>
                              <div className="ticket-subject">{t.sujet}</div>
                              <div className="ticket-client">{t.nomClient || 'Client'} — —</div>
                            </td>
                            <td>
                              <span className="badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                            </td>
                            <td>
                              <span className="priorite-badge" style={{ color: pc.color }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{pc.icon}</span> {pc.label}
                              </span>
                            </td>
                            <td>
                              {initials ? (
                                <div className="assignee">
                                  <div className="assignee-avatar">{initials}</div>
                                  <span>{t.nomAgent}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: 'rgba(230,237,243,0.3)', fontStyle: 'italic' }}>Non assigné</span>
                              )}
                            </td>
                            <td className="time-cell">
                              {t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td>
                              <button className="action-btn" onClick={e => { e.stopPropagation(); }}>⋮</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="pagination">
                    <span className="pagination-info">Affichage de 1-{filtered.length} sur {filtered.length} tickets</span>
                    <div className="pagination-btns">
                      <button className="page-btn">‹</button>
                      {[1,2,3].map(n => <button key={n} className={`page-btn${n===1?' active':''}`}>{n}</button>)}
                      <button className="page-btn">›</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Detail + Messages */}
            {selected ? (
              <div className="detail-panel">
                <div className="detail-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h3 className="detail-subject">{selected.sujet}</h3>
                    <select
                      value={selected.statut}
                      onChange={e => handleStatut(selected.id, e.target.value)}
                      className="statut-select"
                      style={{ color: statutConfig[selected.statut]?.color ?? '#e6edf3' }}
                    >
                      {['OUVERT','EN_COURS','RESOLU','FERME'].map(s => (
                        <option key={s} value={s}>{statutConfig[s]?.label ?? s}</option>
                      ))}
                    </select>
                  </div>
                  <p className="detail-desc">{selected.description}</p>
                  <div className="detail-meta">
                    <span style={{ fontSize: 12, color: 'rgba(230,237,243,0.45)' }}>👤 {selected.nomClient || 'Client'}</span>
                    {selected.nomAgent && <span style={{ fontSize: 12, color: 'rgba(230,237,243,0.45)' }}>🔧 {selected.nomAgent}</span>}
                    {selected.dateCreation && (
                      <span style={{ fontSize: 12, color: 'rgba(230,237,243,0.35)' }}>
                        {new Date(selected.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-zone">
                  {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(230,237,243,0.3)', fontSize: 13, padding: 20 }}>Aucun message</p>
                  ) : messages.map((m: any, i: number) => {
                    const isAgent = m.expediteur === 'AGENT_SAV';
                    const isBot = m.estBot;
                    return (
                      <div key={i} className={`msg-bubble ${isAgent ? 'agent' : isBot ? 'bot' : 'client'}`}>
                        <div className="msg-sender">{isBot ? '🤖 BOT' : m.expediteur}</div>
                        <div className="msg-content">{m.contenu}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Send */}
                <form className="send-form" onSubmit={handleSendMessage}>
                  <input
                    className="send-input"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Écrire un message..."
                  />
                  <button className="send-btn" type="submit" disabled={sending || !message.trim()}>
                    {sending ? '...' : '→'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="empty-panel">
                <p className="empty-text">← Sélectionnez un ticket<br />pour voir les détails</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}