import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Obtener el perfil y progreso del usuario
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('completed_vueltas, page_stats, listen_stats')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows returned"
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      // Si no existe perfil, retornamos valores por defecto vacíos
      return NextResponse.json({
        completedVueltas: {},
        pageStats: {},
        listenStats: {}
      });
    }

    return NextResponse.json({
      completedVueltas: profile.completed_vueltas || {},
      pageStats: profile.page_stats || {},
      listenStats: profile.listen_stats || {}
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { completedVueltas, pageStats, listenStats, name } = await req.json();

    // Guardar o actualizar perfil y progreso
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: name || undefined,
        completed_vueltas: completedVueltas,
        page_stats: pageStats,
        listen_stats: listenStats,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
