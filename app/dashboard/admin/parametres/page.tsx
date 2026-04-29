'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { logout } from '../../../lib/auth';

export default function Parametres() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [showDanger, setShowDanger] = useState(false);

  useEffect(() => {
    setNom(localStorage.getItem('nom') || '');
    setEmail(localStorage.getItem('email') || '');
    setRole(localStorage.getItem('role') || '');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nom', nom);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = nom ? nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SH';
  const roleColors: Record<string, string> = { ADMIN: '#f59e0b', AGENT_COMMERCIAL: '#639dff', AGENT_SAV: '#a78bfa', CLIENT: '#34d399' };

  const menuItems = [
    { icon: '👤', label: 'Profil', active: true },
    { icon: '🔐', label: 'Sécurité', active: false },
    { icon: '🔔', label: 'Notifications', active: false },
    { icon: '🎨', label: 'Préférences', active: false },
  ];

  return (
    <ProtectedRoute>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 1000 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#639dff', marginBottom: 8 }}>Compte</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#f0ece4', margin: 0 }}>Paramètres du Profil</h1>
          <p style={{ color: 'rgba(240,236,228,0.5)', fontSize: 14, marginTop: 4 }}>Gérez vos informations personnelles et préférences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Left menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                background: item.active ? 'rgba(99,157,255,0.1)' : 'transparent',
                borderLeft: item.active ? '2px solid #3b82f6' : '2px solid transparent',
                color: item.active ? '#639dff' : 'rgba(240,236,228,0.5)',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}

            <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
              <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, color: '#f87171', fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span>↩</span>
                <span>Déconnexion</span>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile card */}
            <div style={{ background: '#0b1825', borderRadius: 14, padding: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 24px' }}>Informations Générales</h2>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 0 0 3px rgba(99,157,255,0.3)' }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: '#f0ece4', marginBottom: 4 }}>{nom}</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', marginBottom: 8 }}>{email}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: `${roleColors[role] || '#639dff'}18`, color: roleColors[role] || '#639dff' }}>
                    {role?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '8px 16px', background: 'rgba(99,157,255,0.1)', border: '1px solid rgba(99,157,255,0.2)', borderRadius: 6, color: '#639dff', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    Changer la photo
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom complet</label>
                    <input value={nom} onChange={e => setNom(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adresse Email</label>
                    <input value={email} readOnly
                      style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, color: 'rgba(240,236,228,0.4)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  {saved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, color: '#34d399', fontSize: 13 }}>
                      ✓ Modifications enregistrées
                    </div>
                  )}
                  <button type="submit" style={{ padding: '11px 28px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500 }}>
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>

            {/* Preferences */}
            <div style={{ background: '#0b1825', borderRadius: 14, padding: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ece4', margin: '0 0 20px' }}>
                ⚙️ Préférences de l'Interface
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Mode Sombre', sub: 'Activer le thème visuel sombre', value: darkMode, set: setDarkMode },
                  { label: 'Notifications', sub: 'Recevoir des alertes par email', value: notifs, set: setNotifs },
                ].map((pref, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#f0ece4', fontWeight: 500, marginBottom: 2 }}>{pref.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>{pref.sub}</div>
                    </div>
                    {/* Toggle */}
                    <div onClick={() => pref.set(!pref.value)} style={{ width: 44, height: 24, borderRadius: 100, background: pref.value ? '#3b82f6' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pref.value ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ background: '#0b1825', borderRadius: 14, padding: 28, border: '1px solid rgba(248,113,113,0.15)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f87171', margin: '0 0 8px' }}>Zone de danger</h2>
              <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)', margin: '0 0 16px', lineHeight: 1.6 }}>
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
              </p>
              {!showDanger ? (
                <button onClick={() => setShowDanger(true)} style={{ padding: '10px 20px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                  Supprimer mon compte
                </button>
              ) : (
                <div style={{ background: 'rgba(248,113,113,0.06)', borderRadius: 10, padding: 16, border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>⚠️ Êtes-vous sûr ? Cette action est irréversible.</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowDanger(false)} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0ece4', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>Annuler</button>
                    <button onClick={logout} style={{ padding: '9px 18px', background: '#f87171', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500 }}>Confirmer la suppression</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}