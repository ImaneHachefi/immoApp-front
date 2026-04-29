'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNom, getRole, logout } from '../lib/auth';
import { useEffect, useState } from 'react';

const menus = {
  ADMIN: [
    { icon: '⊞', label: 'Tableau de bord', href: '/dashboard/admin' },
    { icon: '👥', label: 'Utilisateurs', href: '/dashboard/admin/utilisateurs' },
    { icon: '⚙️', label: 'Paramètres', href: '/dashboard/admin/parametres' },
  ],
  AGENT_COMMERCIAL: [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard/agent-commercial' },
    { icon: '🏠', label: 'Biens', href: '/dashboard/agent-commercial/biens' },
    { icon: '👤', label: 'Prospects', href: '/dashboard/agent-commercial/prospects' },
    { icon: '🤖', label: 'Qualification IA', href: '/dashboard/agent-commercial/qualification' },
  ],
  AGENT_SAV: [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard/agent-sav' },
    { icon: '🎫', label: 'Tickets SAV', href: '/dashboard/agent-sav/tickets' },
  ],
  CLIENT: [
    { icon: '🏠', label: 'Catalogue', href: '/dashboard/client' },
    { icon: '🤖', label: 'Chatbot', href: '/dashboard/client/chatbot' },
    { icon: '🎫', label: 'Mes Tickets', href: '/dashboard/client/tickets' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setNom(getNom() || '');
    setRole(getRole() || '');
  }, []);

  const items = menus[role as keyof typeof menus] || [];
  const initials = nom ? nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SH';

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#060e18',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif", position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>S</div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#f0ece4', letterSpacing: '-0.02em' }}>
            SupHouse
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
                color: active ? '#639dff' : 'rgba(240,236,228,0.6)',
                fontSize: 14, fontWeight: active ? 500 : 400,
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ color: '#f0ece4', fontSize: 13, fontWeight: 500 }}>{nom}</div>
            <div style={{ color: 'rgba(240,236,228,0.4)', fontSize: 11 }}>{role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          color: '#f87171', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}>
          ↩ Déconnexion
        </button>
      </div>
    </aside>
  );
}