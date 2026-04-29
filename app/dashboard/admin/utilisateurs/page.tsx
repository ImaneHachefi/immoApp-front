'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface User { id: number; nom: string; email: string; dateCreation: string; role: { nom: string } }

const roleColors: Record<string, string> = {
  ADMIN: '#f59e0b', AGENT_COMMERCIAL: '#639dff', AGENT_SAV: '#a78bfa', CLIENT: '#34d399'
};

export default function Utilisateurs() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', role: 'CLIENT' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/api/auth/users').then(r => setUsers(r.data)).catch(() => setUsers([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/api/auth/register', form);
      setShowModal(false);
      setForm({ nom: '', email: '', motDePasse: '', role: 'CLIENT' });
      load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Administration</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Utilisateurs Actifs</h1>
            <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>Gérez les comptes et leurs privilèges d'accès</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', padding: '12px 24px',
            borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
          }}>+ Nouvel Utilisateur</button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un utilisateur..."
            style={{ width: '100%', maxWidth: 400, padding: '10px 16px', background: '#0b1825', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }} />
        </div>

        {/* Table */}
        <div style={{ background: '#0b1825', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Utilisateur', 'Rôle', 'Date création', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,228,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                        {u.nom[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#f0ece4' }}>{u.nom}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: `${roleColors[u.role?.nom] || '#639dff'}18`, color: roleColors[u.role?.nom] || '#639dff', letterSpacing: '0.05em' }}>
                      {u.role?.nom?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(240,236,228,0.5)' }}>
                    {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0b1825', borderRadius: 16, padding: 32, width: 440, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: '#f0ece4', margin: '0 0 24px' }}>Nouvel utilisateur</h2>
            <form onSubmit={handleCreate}>
              {[
                { label: 'Nom complet', key: 'nom', type: 'text', placeholder: 'Jean Dupont' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'jean@example.com' },
                { label: 'Mot de passe', key: 'motDePasse', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#060e18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }}>
                  {['ADMIN', 'AGENT_COMMERCIAL', 'AGENT_SAV', 'CLIENT'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                  {saving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}