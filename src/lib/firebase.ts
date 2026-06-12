import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración pública del proyecto Firebase (segura para el navegador).
// Los placeholders permiten compilar sin credenciales; en ejecución las
// llamadas fallarán hasta configurar las variables (ver .env.example).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder',
};

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn('Falta configurar las variables de entorno de Firebase (ver .env.example)');
}

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Token de acceso vigente de la sesión actual (solo navegador).
// authStateReady() espera a que Firebase restaure la sesión persistida,
// y getIdToken() refresca el token automáticamente si ha caducado.
export async function getAccessToken(): Promise<string | null> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
