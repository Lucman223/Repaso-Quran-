import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (body.name) {
      await adminDb.collection('profiles').doc(user.id).update({ name: body.name });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
