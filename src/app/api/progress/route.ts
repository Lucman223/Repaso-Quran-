import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection('profiles').doc(user.id).get();
    const data = snap.data();

    return NextResponse.json({
      completedVueltas: data?.completedVueltas || {},
      pageStats: data?.pageStats || {},
      listenStats: data?.listenStats || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { completedVueltas, pageStats, listenStats } = await req.json();

    await adminDb.collection('profiles').doc(user.id).set(
      {
        completedVueltas: completedVueltas || {},
        pageStats: pageStats || {},
        listenStats: listenStats || {},
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
