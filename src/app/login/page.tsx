'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, getAccessToken } from '@/lib/firebase';
import { useRepasaStore } from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const locale = useRepasaStore((state) => state.locale);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Traducciones básicas
  const t = {
    es: {
      title: 'مراجعة',
      subtitle: 'Sistema de Repaso y Memorización',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      name: 'Nombre y Apellidos',
      noAccount: '¿No tienes cuenta? Regístrate',
      haveAccount: '¿Ya tienes cuenta? Inicia sesión',
      loading: 'Cargando...',
      errorGeneric: 'Ha ocurrido un error. Inténtalo de nuevo.',
      successRegister: '¡Registro completado! Ya puedes iniciar sesión.',
      successLogin: '¡Inicio de sesión exitoso! Redirigiendo...',
    },
    tr: {
      title: 'مراجعة',
      subtitle: 'Ezber ve Tekrar Sistemi',
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      email: 'E-posta',
      password: 'Şifre',
      name: 'Ad Soyad',
      noAccount: 'Hesabınız yok mu? Kayıt Olun',
      haveAccount: 'Hesabınız var mı? Giriş Yapın',
      loading: 'Yükleniyor...',
      errorGeneric: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      successRegister: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
      successLogin: 'Giriş başarılı! Yönlendiriliyorsunuz...',
    }
  }[locale] || { es: {}, tr: {} }.es;

  // Si ya está logueado, redirigir
  useEffect(() => {
    auth.authStateReady().then(() => {
      if (auth.currentUser) {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/';
        router.push(redirectTo);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const trimmedEmail = email.trim();
      
      if (isSignUp) {
        // REGISTRO — Firebase deja la sesión iniciada automáticamente
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
      } else {
        // INICIO DE SESIÓN
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }

      setSuccessMsg(t.successLogin);

      // Crear/verificar el perfil en el servidor (el primer usuario se hace admin)
      const token = await getAccessToken();
      if (token) {
        await fetch('/api/auth/me', {
          method: isSignUp ? 'POST' : 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: isSignUp ? JSON.stringify({ name }) : undefined
        });
      }

      // Sincronizar el progreso desde el servidor (fusiona con el local)
      await useRepasaStore.getState().loadProgressFromServer();

      // Redirigir al inicio o a la ruta redireccionada
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const code = (err as { code?: string })?.code || '';
      const friendly: Record<string, string> = {
        'auth/email-already-in-use': 'Ese correo ya está registrado. Inicia sesión.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/wrong-password': 'Correo o contraseña incorrectos.',
        'auth/user-not-found': 'No existe ninguna cuenta con ese correo.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'El correo no es válido.',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      };
      setErrorMsg(friendly[code] || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center premium-gradient px-4 text-[var(--color-foreground)]">
      <div className="w-full max-w-md z-10">
        {/* Cabecera del formulario */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-extrabold text-[var(--color-primary)] drop-shadow-sm select-none tracking-wider mb-2 font-serif">
            {t.title}
          </h1>
          <p className="opacity-70 font-medium tracking-wide">
            {t.subtitle}
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="premium-card p-8 rounded-2xl shadow-xl relative">
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)] text-center">
            {isSignUp ? t.register : t.login}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-2 select-none">
                  {t.name}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none transition-all duration-300 placeholder:opacity-50 font-medium shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold opacity-80 mb-2 select-none">
                {t.email}
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none transition-all duration-300 placeholder:opacity-50 font-medium shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold opacity-80 mb-2 select-none">
                {t.password}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none transition-all duration-300 placeholder:opacity-50 font-medium shadow-sm"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-primary)] hover:opacity-90 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/30 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? t.loading : (isSignUp ? t.register : t.login)}
            </button>
          </form>

          {/* Toggle entre login y registro */}
          <div className="mt-6 text-center relative z-10">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 hover:underline transition-all duration-300 cursor-pointer"
            >
              {isSignUp ? t.haveAccount : t.noAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
