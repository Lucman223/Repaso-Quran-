import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'No autorizado - Acceso exclusivo para administradores' }, { status: 403 });
  }

  try {
    // Obtener todos los perfiles de usuario
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, role, completed_vueltas, page_stats, listen_stats, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
