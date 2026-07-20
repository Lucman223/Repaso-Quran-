'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRepasaStore } from '@/store/useStore';
import { getAccessToken } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  completedVueltas: Record<string, number[]>;
  pageStats: Record<string, { listenCount: number; recordCount: number }>;
  listenStats: Record<string, unknown>;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const locale = useRepasaStore((state) => state.locale);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    es: {
      title: 'Panel de Administración',
      subtitle: 'Seguimiento de progreso de tus compañeros',
      searchPlaceholder: 'Buscar por nombre o correo...',
      colUser: 'Usuario',
      colRole: 'Rol',
      colCompleted: 'Páginas Completadas',
      colLastActive: 'Última Actividad',
      statsCompleted: 'vueltas hechas',
      back: 'Volver al Inicio',
      noUsers: 'No se encontraron usuarios.',
      unauthorized: 'Acceso denegado. No eres administrador.',
      loading: 'Cargando panel administrativo...'
    },
    tr: {
      title: 'Yönetici Paneli',
      subtitle: 'Arkadaşlarınızın ilerleme takibi',
      searchPlaceholder: 'İsim veya e-posta ile ara...',
      colUser: 'Kullanıcı',
      colRole: 'Rol',
      colCompleted: 'Tamamlanan Sayfalar',
      colLastActive: 'Son Aktiflik',
      statsCompleted: 'tamamlanan tur',
      back: 'Ana Sayfaya Dön',
      noUsers: 'Kullanıcı bulunamadı.',
      unauthorized: 'Erişim engellendi. Yönetici değilsiniz.',
      loading: 'Yönetici paneli yükleniyor...'
    }
  }[locale] || { es: {}, tr: {} }.es;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.push('/login?redirect=/admin');
          return;
        }

        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json();
          setErrorMsg(errData.error || t.unauthorized);
        } else {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        console.error(e);
        setErrorMsg(t.unauthorized);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t.unauthorized]);

  const countCompletedVueltas = (completedVueltas: Record<string, number[]>) => {
    if (!completedVueltas) return 0;
    return Object.values(completedVueltas).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      (u.name && u.name.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] font-medium">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] px-4 text-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-6 py-5 rounded-2xl max-w-md shadow-xl mb-6">
          <p className="font-bold text-lg mb-2">⚠️ Error</p>
          <p>{errorMsg}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 premium-card hover:border-[var(--color-primary)] active:scale-[0.98] rounded-xl font-semibold transition-all cursor-pointer"
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-gradient text-[var(--color-foreground)] p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)] font-amiri tracking-wider">
              {t.title}
            </h1>
            <p className="opacity-60 font-medium mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="self-start md:self-auto px-5 py-2.5 bg-[var(--color-card)] hover:border-[var(--color-primary)] border border-[var(--color-border)] rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            ← {t.back}
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none transition-all placeholder:opacity-50 font-medium shadow-sm"
          />
        </div>

        {/* Tabla/Lista de usuarios */}
        <div className="premium-card rounded-2xl overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-primary)]/5 opacity-80 text-sm font-semibold select-none">
                  <th className="p-4 pl-6">{t.colUser}</th>
                  <th className="p-4">{t.colRole}</th>
                  <th className="p-4 text-center">{t.colCompleted}</th>
                  <th className="p-4 pr-6">{t.colLastActive}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center opacity-60 font-medium">
                      {t.noUsers}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const completedCount = countCompletedVueltas(user.completedVueltas);
                    const lastActive = new Date(user.updatedAt).toLocaleString(locale === 'es' ? 'es-ES' : 'tr-TR', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    });

                    return (
                      <tr key={user.id} className="hover:bg-[var(--color-primary)]/5 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-semibold">{user.name || 'Sin nombre'}</div>
                          <div className="text-xs opacity-60 font-medium">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                            user.role.toLowerCase() === 'admin' 
                              ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                              : 'bg-[var(--color-background)] opacity-60 border border-[var(--color-border)]'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-bold text-[var(--color-primary)] text-lg">
                            {completedCount}
                          </div>
                          <div className="text-xs opacity-60">{t.statsCompleted}</div>
                        </td>
                        <td className="p-4 pr-6 text-sm opacity-60 font-medium">
                          {lastActive}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
