'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { logout } from '../../../lib/auth';
import { User, Shield, Bell, Palette, LogOut, Check, Camera } from 'lucide-react';

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
  const roleColors: Record<string, string> = { ADMIN: '#d4a017', AGENT_COMMERCIAL: '#2563eb', AGENT_SAV: '#7c3aed', CLIENT: '#10b981' };

  const menuItems = [
    { icon: <User className="w-4 h-4" />, label: 'Profil', active: true },
    { icon: <Shield className="w-4 h-4" />, label: 'Sécurité', active: false },
    { icon: <Bell className="w-4 h-4" />, label: 'Notifications', active: false },
    { icon: <Palette className="w-4 h-4" />, label: 'Préférences', active: false },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-[1000px]">

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Compte</div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Paramètres du Profil</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">

          {/* Left menu - hidden on mobile */}
          <div className="hidden md:flex flex-col gap-1">
            {menuItems.map((item, i) => (
              <button key={i} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer w-full text-left ${
                item.active
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent'
              }`}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="mt-2 border-t border-surface-border pt-2">
              <button onClick={logout} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer w-full">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="flex flex-col gap-5">

            {/* Profile card */}
            <div className="bg-surface rounded-xl p-6 md:p-7 border border-surface-border shadow-sm">
              <h2 className="font-display text-xl font-medium text-foreground mb-6">Informations Générales</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-7 p-4 bg-muted/50 rounded-xl border border-surface-border/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0 ring-3 ring-primary/20">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl font-medium text-foreground mb-1 truncate">{nom}</div>
                  <div className="text-sm text-muted-foreground mb-2">{email}</div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `${roleColors[role] || '#2563eb'}18`, color: roleColors[role] || '#2563eb' }}
                  >
                    {role?.replace('_', ' ')}
                  </span>
                </div>
                <button className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-medium hover:bg-primary/15 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Changer la photo
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Nom complet</label>
                    <input value={nom} onChange={e => setNom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted border border-surface-border rounded-lg text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Adresse Email</label>
                    <input value={email} readOnly
                      className="w-full px-3.5 py-2.5 bg-muted/50 border border-surface-border/50 rounded-lg text-muted-foreground text-sm outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  {saved && (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Modifications enregistrées
                    </div>
                  )}
                  <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:brightness-110 transition-all text-sm font-medium shadow-sm">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>

            {/* Preferences */}
            <div className="bg-surface rounded-xl p-6 md:p-7 border border-surface-border shadow-sm">
              <h2 className="font-display text-xl font-medium text-foreground mb-5">Préférences de l&apos;Interface</h2>
              <div className="flex flex-col">
                {[
                  { label: 'Mode Sombre', sub: 'Activer le thème visuel sombre', value: darkMode, set: setDarkMode },
                  { label: 'Notifications', sub: 'Recevoir des alertes par email', value: notifs, set: setNotifs },
                ].map((pref, i) => (
                  <div key={i} className={`flex justify-between items-center py-4 ${i < 1 ? 'border-b border-surface-border/50' : ''}`}>
                    <div>
                      <div className="text-sm font-medium text-foreground mb-0.5">{pref.label}</div>
                      <div className="text-xs text-muted-foreground">{pref.sub}</div>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => pref.set(!pref.value)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 cursor-pointer ${pref.value ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                      role="switch"
                      aria-checked={pref.value}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-[left] duration-300 shadow-sm ${pref.value ? 'left-[23px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-surface rounded-xl p-6 md:p-7 border border-red-500/15 shadow-sm">
              <h2 className="font-display text-xl font-medium text-red-500 dark:text-red-400 mb-2">Zone de danger</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
              </p>
              {!showDanger ? (
                <button onClick={() => setShowDanger(true)} className="px-5 py-2.5 bg-red-500/5 border border-red-500/15 rounded-lg text-red-500 dark:text-red-400 cursor-pointer hover:bg-red-500/10 transition-colors text-sm font-medium">
                  Supprimer mon compte
                </button>
              ) : (
                <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/15">
                  <p className="text-sm text-red-500 dark:text-red-400 mb-3 font-medium">⚠ Êtes-vous sûr ? Cette action est irréversible.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDanger(false)} className="px-4 py-2 bg-muted border border-surface-border rounded-lg text-foreground cursor-pointer hover:bg-muted/80 transition-colors text-sm">Annuler</button>
                    <button onClick={logout} className="px-4 py-2 bg-red-500 rounded-lg text-white cursor-pointer hover:bg-red-600 transition-colors text-sm font-medium">Confirmer la suppression</button>
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