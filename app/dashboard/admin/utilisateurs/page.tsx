'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Users, UserPlus, Search, Trash2, X } from 'lucide-react';

interface User { id: number; nom: string; email: string; dateCreation: string; role: { nom: string } }

const roleColors: Record<string, string> = {
  ADMIN: '#d4a017', AGENT_COMMERCIAL: '#2563eb', AGENT_SAV: '#7c3aed', CLIENT: '#10b981'
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
      <div className="max-w-[1100px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Administration</div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Utilisateurs Actifs</h1>
            <p className="text-muted-foreground text-sm mt-1">Gérez les comptes et leurs privilèges d&apos;accès</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm font-medium flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-sm">
            <UserPlus className="w-4 h-4" />
            Nouvel Utilisateur
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-border">
                {['Utilisateur', 'Rôle', 'Date création', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-surface-border/50 hover:bg-muted/50 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                        {u.nom[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{u.nom}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full tracking-wider"
                      style={{ background: `${roleColors[u.role?.nom] || '#2563eb'}18`, color: roleColors[u.role?.nom] || '#2563eb' }}
                    >
                      {u.role?.nom?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">
                    {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="bg-red-500/5 border border-red-500/15 text-red-500 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5">
                      <Trash2 className="w-3 h-3" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-surface rounded-2xl p-8 w-[440px] max-w-[90vw] border border-surface-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-medium text-foreground">Nouvel utilisateur</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              {[
                { label: 'Nom complet', key: 'nom', type: 'text', placeholder: 'Jean Dupont' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'jean@example.com' },
                { label: 'Mot de passe', key: 'motDePasse', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key} className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50" />
                </div>
              ))}
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary cursor-pointer">
                  {['ADMIN', 'AGENT_COMMERCIAL', 'AGENT_SAV', 'CLIENT'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground cursor-pointer hover:bg-muted/80 transition-colors text-sm font-medium">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:brightness-110 transition-all text-sm font-medium">
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