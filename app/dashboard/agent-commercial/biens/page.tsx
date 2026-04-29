'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Bien {
  id: number;
  titre: string;
  description: string;
  prix: number;
  disponible: boolean;
  localisation: string;
  superficie: number;
  dateAjout: string;
  photos: { url: string }[];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#1e2a3a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f4f8',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(240,244,248,0.5)',
  display: 'block',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  fontFamily: "'DM Sans', sans-serif",
};

const FALLBACK = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80';

const CHAMBRES_MAP: Record<number, number> = {};
const SALLES_MAP: Record<number, number> = {};

function fakeChambres(id: number) {
  if (!CHAMBRES_MAP[id]) CHAMBRES_MAP[id] = [1, 2, 3, 4, 5][id % 5];
  return CHAMBRES_MAP[id];
}
function fakeSalles(id: number) {
  if (!SALLES_MAP[id]) SALLES_MAP[id] = [1, 2, 3][id % 3];
  return SALLES_MAP[id];
}

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

  const load = () => {
    api.get('/api/biens').then(r => setBiens(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/api/biens', { ...form, prix: parseFloat(form.prix), superficie: parseFloat(form.superficie), photos: form.photos.filter(Boolean) });
      setShowModal(false);
      setForm({ titre: '', description: '', prix: '', disponible: true, localisation: '', superficie: '', photos: [''] });
      load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleOpenEdit = (b: Bien) => {
    setEditingBien(b);
    setEditForm({
      titre: b.titre, description: b.description, prix: String(b.prix),
      disponible: b.disponible, localisation: b.localisation,
      superficie: String(b.superficie),
      photos: b.photos?.length > 0 ? b.photos.map(p => p.url) : ['']
    });
    setShowEditModal(true); setError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.put(`/api/biens/${editingBien!.id}`, {
        ...editForm, prix: parseFloat(editForm.prix),
        superficie: parseFloat(editForm.superficie),
        photos: editForm.photos.filter(Boolean)
      });
      setShowEditModal(false); setEditingBien(null); load();
    } catch (err: any) { setError(err.response?.data?.erreur || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce bien ?')) return;
    try { await api.delete(`/api/biens/${id}`); setBiens(prev => prev.filter(b => b.id !== id)); } catch (e) { console.error(e); }
  };

  const toggleFav = (id: number) => {
    setFavorites(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const getPhoto = (b: Bien) => b.photos?.length > 0 && b.photos[0]?.url ? b.photos[0].url : FALLBACK;

  const fields = [
    { label: 'Titre', key: 'titre', type: 'text', placeholder: 'Villa Casablanca' },
    { label: 'Localisation', key: 'localisation', type: 'text', placeholder: 'Casablanca' },
    { label: 'Prix (DH)', key: 'prix', type: 'number', placeholder: '2500000' },
    { label: 'Superficie (m²)', key: 'superficie', type: 'number', placeholder: '350' },
  ];

  const renderForm = (
    formData: typeof form,
    setFormData: (v: any) => void,
    onSubmit: (e: React.FormEvent) => void,
    onCancel: () => void,
    title: string,
    submitLabel: string
  ) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#0f1923', borderRadius: 16, padding: 32, width: 520, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 600, color: '#f0f4f8', margin: '0 0 24px' }}>{title}</h2>
        <form onSubmit={onSubmit}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={(formData as any)[f.key]}
                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} required style={inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>URL Photo</label>
            <input type="url" placeholder="https://..." value={formData.photos[0]}
              onChange={e => setFormData({ ...formData, photos: [e.target.value] })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="dispo" checked={formData.disponible} onChange={e => setFormData({ ...formData, disponible: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
            <label htmlFor="dispo" style={{ fontSize: 13, color: 'rgba(240,244,248,0.7)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Disponible</label>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onCancel}
              style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f4f8', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>
              {saving ? 'Enregistrement...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_COMMERCIAL']}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .bien-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .bien-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
        .fav-btn { transition: transform 0.2s ease; }
        .fav-btn:hover { transform: scale(1.15); }
        .filter-pill:hover { background: rgba(37,99,235,0.15) !important; border-color: rgba(37,99,235,0.5) !important; }
        .action-btn { transition: opacity 0.15s, transform 0.15s; }
        .action-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .page-btn:hover { background: rgba(37,99,235,0.2) !important; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#f0f4f8' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f4f8', margin: 0 }}>Propriétés à vendre</h1>
            <p style={{ color: 'rgba(240,244,248,0.4)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
              {biens.length} résultat{biens.length > 1 ? 's' : ''} trouvé{biens.length > 1 ? 's' : ''} pour votre recherche
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#2563eb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              🗺️ Vue Carte
            </button>
            <button className="action-btn" onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#16a34a', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              + Ajouter
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Type de bien', icon: '▾' },
            { label: 'Budget', icon: '▾' },
            { label: 'Chambres', icon: '▾' },
            { label: 'Surface', icon: '▾' },
            { label: '⚙️ Plus de filtres', icon: '' },
          ].map(f => (
            <button key={f.label} className="filter-pill"
              style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 100, color: '#c8d3e0', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
              {f.label} {f.icon && <span style={{ opacity: 0.5, fontSize: 11 }}>{f.icon}</span>}
            </button>
          ))}
        </div>

        {/* Grille */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'rgba(240,244,248,0.3)', fontSize: 14 }}>Chargement...</div>
        ) : biens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'rgba(240,244,248,0.3)', fontSize: 14 }}>Aucun bien trouvé</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {biens.map(b => (
              <div key={b.id} className="bien-card"
                style={{ background: '#162031', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>

                {/* Image */}
                <div style={{ position: 'relative', height: 195 }}>
                  <img src={getPhoto(b)} alt={b.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }} />

                  {/* Badge */}
                  {b.disponible && (
                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#2563eb', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        NOUVEAU
                      </span>
                    </div>
                  )}

                  {/* Favori */}
                  <button className="fav-btn" onClick={() => toggleFav(b.id)}
                    style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: favorites.has(b.id) ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.88)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {favorites.has(b.id) ? '❤️' : '🤍'}
                  </button>
                </div>

                {/* Contenu */}
                <div style={{ padding: '16px 18px 18px' }}>
                  {/* Titre + Prix */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0f4f8', margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.titre}
                    </h3>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {b.prix?.toLocaleString()} DH
                    </span>
                  </div>

                  {/* Localisation */}
                  <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.42)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11 }}>📍</span> {b.localisation}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(240,244,248,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      🛏 <strong style={{ color: '#c8d3e0', fontWeight: 500 }}>{fakeChambres(b.id)} Ch.</strong>
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(240,244,248,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      🚿 <strong style={{ color: '#c8d3e0', fontWeight: 500 }}>{fakeSalles(b.id)} Sdb.</strong>
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(240,244,248,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      📐 <strong style={{ color: '#c8d3e0', fontWeight: 500 }}>{b.superficie} m²</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn" onClick={() => handleOpenEdit(b)}
                      style={{ flex: 1, padding: '8px 0', background: 'rgba(37,99,235,0.13)', border: '1px solid rgba(37,99,235,0.28)', borderRadius: 8, color: '#60a5fa', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      ✏️ Modifier
                    </button>
                    <button className="action-btn" onClick={() => handleDelete(b.id)}
                      style={{ flex: 1, padding: '8px 0', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {biens.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 40, paddingBottom: 80 }}>
            {['‹', '1', '2', '3', '...', '10', '›'].map((p, i) => (
              <button key={i} className="page-btn"
                style={{ width: 36, height: 36, borderRadius: 8, border: p === '1' ? 'none' : '1px solid rgba(255,255,255,0.09)', background: p === '1' ? '#2563eb' : 'rgba(255,255,255,0.03)', color: p === '1' ? '#fff' : 'rgba(240,244,248,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Floating CTA */}
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
          <button className="action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'rgba(15,25,35,0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, color: '#f0f4f8', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
            🗺️ Explorer sur la carte
          </button>
        </div>
      </div>

      {/* Modal Création */}
      {showModal && renderForm(
        form, setForm, handleCreate,
        () => { setShowModal(false); setError(''); },
        'Nouveau bien', 'Créer le bien'
      )}

      {/* Modal Modification */}
      {showEditModal && renderForm(
        editForm, setEditForm, handleEdit,
        () => { setShowEditModal(false); setError(''); },
        'Modifier le bien', 'Enregistrer'
      )}
    </ProtectedRoute>
  );
}