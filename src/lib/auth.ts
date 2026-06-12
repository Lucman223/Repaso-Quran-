import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from './firebaseAdmin';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  role: string;
}

// Crea el perfil en Firestore si no existe. El primer perfil de la
// plataforma se convierte automáticamente en admin.
async function ensureProfile(uid: string, email?: string, name?: string) {
  const ref = adminDb.collection('profiles').doc(uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data() as { role?: string; name?: string };

  const countSnap = await adminDb.collection('profiles').count().get();
  const role = countSnap.data().count === 0 ? 'admin' : 'user';

  const profile = {
    email: email || '',
    name: name || '',
    role,
    completedVueltas: {},
    pageStats: {},
    listenStats: {},
    updatedAt: new Date().toISOString(),
  };
  await ref.set(profile);
  return profile;
}

export async function getAuthUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const profile = await ensureProfile(decoded.uid, decoded.email, decoded.name);

    return {
      id: decoded.uid,
      email: decoded.email,
      name: profile?.name || '',
      role: profile?.role || 'user',
    };
  } catch (e) {
    console.error('Error al autenticar usuario:', e);
    return null;
  }
}
