'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

  // Si ya está logueado, redirigir a inicio
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // REGISTRO
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // En Supabase, a veces requiere confirmación de email.
          // Si no está activa la confirmación de email, podemos iniciar sesión o pedir que lo haga.
          setSuccessMsg(t.successRegister);
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        // INICIO DE SESIÓN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          setSuccessMsg(t.successLogin);

          // Sincronizar el progreso desde el servidor (fusiona con el local)
          await useRepasaStore.getState().loadProgressFromServer();

          // Redirigir al inicio
          router.push('/');
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 text-white">
      {/* Círculos decorativos con gradientes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Cabecera del formulario */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-md select-none tracking-wider mb-2 font-serif">
            {t.title}
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            {t.subtitle}
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-slate-100 text-center">
            {isSignUp ? t.register : t.login}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 select-none">
                  {t.name}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder:text-slate-600 font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 select-none">
                {t.email}
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 select-none">
                {t.password}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder:text-slate-600 font-medium"
              />
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm font-medium">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? t.loading : (isSignUp ? t.register : t.login)}
            </button>
          </form>

          {/* Toggle entre login y registro */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-all duration-300 cursor-pointer"
            >
              {isSignUp ? t.haveAccount : t.noAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
