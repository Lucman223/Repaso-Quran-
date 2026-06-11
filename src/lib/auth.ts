import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from './supabase';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    // Verificamos el token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Buscamos el rol del usuario en la tabla de perfiles (por defecto 'user').
    // Hay que usar el cliente admin: el cliente anon no lleva el JWT del usuario
    // en esta petición, así que RLS bloquearía la lectura y el rol siempre sería 'user'.
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
    };
  } catch (e) {
    console.error('Error al autenticar usuario:', e);
    return null;
  }
}
