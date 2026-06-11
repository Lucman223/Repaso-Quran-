-- 1. Crear tabla de perfiles (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    completed_vueltas JSONB DEFAULT '{}'::jsonb,
    page_stats JSONB DEFAULT '{}'::jsonb,
    listen_stats JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas de seguridad (RLS Policies)
-- Permite a cada usuario leer su propio perfil
CREATE POLICY "Permitir lectura del propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Permite a cada usuario modificar su propio perfil
CREATE POLICY "Permitir actualización del propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Permite a cada usuario insertar su propio perfil (opcional, si no usamos trigger)
CREATE POLICY "Permitir inserción del propio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Función auxiliar para comprobar si el usuario actual es admin.
-- SECURITY DEFINER evita la recursión infinita de RLS: una política sobre
-- profiles no puede consultar profiles directamente (se re-evaluarían las
-- políticas y Postgres lanzaría "infinite recursion detected in policy").
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Permite a los administradores ver todos los perfiles
CREATE POLICY "Permitir a los administradores ver todo"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- 3. Crear función y trigger para registrar automáticamente el perfil al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- El primer usuario registrado será automáticamente admin, los siguientes serán user
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función al insertar un usuario en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
