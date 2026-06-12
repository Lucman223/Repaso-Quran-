import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'No autorizado - Acceso exclusivo para administradores' }, { status: 403 });
  }

  try {
    const snap = await adminDb
      .collection('profiles')
      .orderBy('updatedAt', 'desc')
      .get();

    const profiles = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        name: data.name || '',
        role: data.role || 'user',
        completedVueltas: data.completedVueltas || {},
        pageStats: data.pageStats || {},
        listenStats: data.listenStats || {},
        updatedAt: data.updatedAt || '',
      };
    });

    return NextResponse.json(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
