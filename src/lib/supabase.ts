import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Falta configurar las variables de entorno de Supabase: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.example)');
}

// Placeholders para que el build no falle sin credenciales (createClient lanza
// una excepción con URL vacía en tiempo de importación). En ejecución, las
// llamadas fallarán con el warning de arriba hasta configurar .env.local.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Cliente administrador para el backend (permite listar usuarios, modificar roles, etc.)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback al cliente anon si no hay key de admin

// Token de acceso vigente de la sesión actual (solo navegador).
// Preferir esto a guardar el token en localStorage: supabase-js lo refresca
// automáticamente y un token guardado a mano acaba caducando.
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
