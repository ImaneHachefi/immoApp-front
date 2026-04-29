'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import Link from 'next/link';

interface Bien { id: number; titre: string; description: string; prix: number; disponible: boolean; localisation: string; superficie: number; photos: { url: string }[] }

export default function ClientCatalogue() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [localisation, setLocalisation] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get('/api/biens/disponibles').then(r => setBiens(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!localisation) return;
    setLoading(true);
    try {
      const res = await api.get('/api/biens/recherche', { params: { localisation, prixMin: 0, prixMax: prixMax ? parseFloat(prixMax) : 99999999 } });
      setBiens(res.data); setSearched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setLocalisation(''); setPrixMax(''); setSearched(false); setLoading(true);
    api.get('/api/biens/disponibles').then(r => setBiens(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  const getPhoto = (b: Bien) => b.photos?.length > 0 && b.photos[0]?.url ? b.photos[0].url : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80';

  return (
    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>SupHouse</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Propriétés à la Une</h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>{biens.length} propriété{biens.length > 1 ? 's' : ''} disponible{biens.length > 1 ? 's' : ''}</p>
        </div>

        {/* Search bar */}
        <div style={{ background: '#0b1825', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Localisation</label>
            <input value={localisation} onChange={e => setLocalisation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Casablanca, Rabat..."
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Budget max (DH)</label>
            <input value={prixMax} onChange={e => setPrixMax(e.target.value)} placeholder="Ex: 2000000"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSearch} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500 }}>
              🔍 Rechercher
            </button>
            {searched && <button onClick={reset} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(240,236,228,0.7)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>✕ Réinitialiser</button>}
          </div>
        </div>

        {/* Shortcut to chatbot */}
        <div style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(59,130,246,0.08))', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#f0ece4', marginBottom: 4 }}>🤖 Laissez notre IA vous guider</div>
            <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)' }}>Notre chatbot analyse vos préférences et vous recommande les meilleures propriétés.</div>
          </div>
          <Link href="/dashboard/client/chatbot">
            <button style={{ padding: '10px 20px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#639dff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, whiteSpace: 'nowrap' }}>
              Démarrer le chatbot →
            </button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>Chargement...</div>
        ) : biens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(240,236,228,0.4)', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏚️</div>
            Aucune propriété disponible
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {biens.map(b => (
              <div key={b.id} style={{ background: '#0b1825', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 50px rgba(0,0,0,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  <img src={getPhoto(b)} alt={b.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80'; }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }} />
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 100, background: 'rgba(52,211,153,0.9)', color: '#fff' }}>VENTE</span>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,14,24,0.7) 0%, transparent 50%)' }} />
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: '#f0ece4', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{b.titre}</h3>
                  <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', marginBottom: 14, display: 'flex', gap: 12 }}>
                    <span>📍 {b.localisation}</span>
                    <span>📐 {b.superficie} m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#639dff' }}>
                      {b.prix?.toLocaleString()} DH
                    </div>
                    <button style={{ padding: '8px 16px', background: 'rgba(99,157,255,0.1)', border: '1px solid rgba(99,157,255,0.2)', borderRadius: 6, color: '#639dff', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}