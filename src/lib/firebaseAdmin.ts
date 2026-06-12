import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// SDK de administración (solo servidor). Lee la cuenta de servicio del env
// FIREBASE_SERVICE_ACCOUNT (el JSON completo descargado de la consola de
// Firebase: Project Settings > Service accounts > Generate new private key).
function createAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    console.warn('Falta configurar FIREBASE_SERVICE_ACCOUNT (ver .env.example)');
    return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder' });
  }

  return initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
}

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
