'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getRole } from '../lib/auth';
import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (allowedRoles) {
      const role = getRole();
      if (!role || !allowedRoles.includes(role)) { router.push('/login'); return; }
    }
    setOk(true);
  }, []);

  if (!ok) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060e18' }}>
      <div style={{ color: '#639dff', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060e18', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px', color: '#f0ece4', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}