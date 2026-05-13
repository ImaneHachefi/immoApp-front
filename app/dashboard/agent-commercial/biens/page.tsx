'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Plus, MapPin, BedDouble, ShowerHead, Ruler, Pencil, Trash2, Heart, Map, X } from 'lucide-react';

interface Bien {
  id: number; titre: string; description: string; prix: number;
  disponible: boolean; localisation: string; superficie: number;
  dateAjout: string; photos: { url: string }[];
}

const FALLBACK = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80';
const CHAMBRES_MAP: Record<number, number> = {};
const SALLES_MAP: Record<number, number> = {};
function fakeChambres(id: number) { if (!CHAMBRES_MAP[id]) CHAMBRES_MAP[id] = [1, 2, 3, 4, 5][id % 5]; return CHAMBRES_MAP[id]; }
function fakeSalles(id: number) { if (!SALLES_MAP[id]) SALLES_MAP[id] = [1, 2, 3][id % 3]; return SALLES_MAP[id]; }

export default function Biens() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', prix: '', disponible: true, localisation: '', superficie: '', photos: [''] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBien, setEditingBien] = useState<Bien | null>(null);
  const [editForm, setEditForm] = useState({ titre: '', description: '', prix: '', disponible: true, localisation: '', superficie: '', photos: [''] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const load = () => { api.get('/api/biens').then(r => setBiens(r.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/api/biens', { ...form, prix: parseFloat(form.prix), superficie: parseFloat(form.superficie), photos: form.photos.filter(Boolean) });
      setShowModal(false); setForm({ titre: '', description: '', prix: '', disponible: true, localisation: '', superficie: '', photos: [''] }); load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); } finally { setSaving(false); }
  };

  const handleOpenEdit = (b: Bien) => {
    setEditingBien(b);
    setEditForm({ titre: b.titre, description: b.description, prix: String(b.prix), disponible: b.disponible, localisation: b.localisation, superficie: String(b.superficie), photos: b.photos?.length > 0 ? b.photos.map(p => p.url) : [''] });
    setShowEditModal(true); setError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.put(`/api/biens/${editingBien!.id}`, { ...editForm, prix: parseFloat(editForm.prix), superficie: parseFloat(editForm.superficie), photos: editForm.photos.filter(Boolean) });
      setShowEditModal(false); setEditingBien(null); load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Supprimer ce bien ?')) return; try { await api.delete(`/api/biens/${id}`); setBiens(prev => prev.filter(b => b.id !== id)); } catch (e) { console.error(e); } };
  const toggleFav = (id: number) => { setFavorites(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); };
  const getPhoto = (b: Bien) => b.photos?.length > 0 && b.photos[0]?.url ? b.photos[0].url : FALLBACK;

  const fields = [
    { label: 'Titre', key: 'titre', type: 'text', placeholder: 'Villa Casablanca' },
    { label: 'Localisation', key: 'localisation', type: 'text', placeholder: 'Casablanca' },
    { label: 'Prix (DH)', key: 'prix', type: 'number', placeholder: '2500000' },
    { label: 'Superficie (m²)', key: 'superficie', type: 'number', placeholder: '350' },
  ];

  const renderModal = (formData: typeof form, setFormData: (v: any) => void, onSubmit: (e: React.FormEvent) => void, onCancel: () => void, title: string, submitLabel: string) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-surface rounded-2xl p-8 w-[520px] max-w-[90vw] max-h-[90vh] overflow-y-auto border border-surface-border shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-medium text-foreground">{title}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit}>
          {fields.map(f => (
            <div key={f.key} className="mb-3.5">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={(formData as any)[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} required
                className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50" />
            </div>
          ))}
          <div className="mb-3.5">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
              className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary resize-y placeholder:text-muted-foreground/50" />
          </div>
          <div className="mb-3.5">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">URL Photo</label>
            <input type="url" placeholder="https://..." value={formData.photos[0]} onChange={e => setFormData({ ...formData, photos: [e.target.value] })}
              className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary placeholder:text-muted-foreground/50" />
          </div>
          <div className="mb-5 flex items-center gap-2.5">
            <input type="checkbox" id="dispo" checked={formData.disponible} onChange={e => setFormData({ ...formData, disponible: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
            <label htmlFor="dispo" className="text-sm text-foreground cursor-pointer">Disponible</label>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground cursor-pointer hover:bg-muted/80 transition-colors text-sm font-medium">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:brightness-110 transition-all text-sm font-medium">{saving ? 'Enregistrement...' : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <div className="max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-border mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Propriétés à vendre</h1>
            <p className="text-muted-foreground text-sm">{biens.length} résultat{biens.length > 1 ? 's' : ''} trouvé{biens.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium cursor-pointer hover:bg-primary/15 transition-colors">
              <Map className="w-4 h-4" /> Vue Carte
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:brightness-110 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Chargement...</div>
        ) : biens.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Aucun bien trouvé</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {biens.map(b => (
              <div key={b.id} className="bg-surface rounded-xl overflow-hidden border border-surface-border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={getPhoto(b)} alt={b.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }} />
                  {b.disponible && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-primary text-primary-foreground uppercase tracking-wider">Disponible</span>
                    </div>
                  )}
                  <button onClick={() => toggleFav(b.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    style={{ background: favorites.has(b.id) ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>
                    <Heart className={`w-4 h-4 ${favorites.has(b.id) ? 'text-white fill-white' : 'text-gray-500'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground truncate flex-1">{b.titre}</h3>
                    <span className="text-sm font-bold text-primary whitespace-nowrap shrink-0">{b.prix?.toLocaleString()} DH</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.localisation}</div>
                  <div className="flex gap-4 mb-4 pb-3.5 border-b border-surface-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> <strong className="text-foreground font-medium">{fakeChambres(b.id)} Ch.</strong></span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><ShowerHead className="w-3.5 h-3.5" /> <strong className="text-foreground font-medium">{fakeSalles(b.id)} Sdb.</strong></span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> <strong className="text-foreground font-medium">{b.superficie} m²</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(b)} className="flex-1 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-medium cursor-pointer hover:bg-primary/15 transition-colors flex items-center justify-center gap-1.5">
                      <Pencil className="w-3 h-3" /> Modifier
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="flex-1 py-2 bg-red-500/5 border border-red-500/15 rounded-lg text-red-500 dark:text-red-400 text-xs font-medium cursor-pointer hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating CTA */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button className="flex items-center gap-2.5 px-6 py-3 bg-surface/95 backdrop-blur-xl border border-surface-border rounded-full text-foreground text-sm font-medium cursor-pointer hover:shadow-xl transition-all shadow-lg">
            <Map className="w-4 h-4 text-primary" /> Explorer sur la carte
          </button>
        </div>
      </div>

      {showModal && renderModal(form, setForm, handleCreate, () => { setShowModal(false); setError(''); }, 'Nouveau bien', 'Créer le bien')}
      {showEditModal && renderModal(editForm, setEditForm, handleEdit, () => { setShowEditModal(false); setError(''); }, 'Modifier le bien', 'Enregistrer')}
    </ProtectedRoute>
  );
}