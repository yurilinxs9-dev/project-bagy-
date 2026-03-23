-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS public.videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price TEXT NOT NULL,
  product_image TEXT NOT NULL,
  product_url TEXT NOT NULL,
  whatsapp TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de configurações (sempre 1 linha, id=1)
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp_default TEXT NOT NULL DEFAULT '',
  accent_color TEXT NOT NULL DEFAULT '#c8344d',
  autoplay BOOLEAN NOT NULL DEFAULT TRUE,
  autoplay_delay INTEGER NOT NULL DEFAULT 8000,
  show_arrows BOOLEAN NOT NULL DEFAULT TRUE,
  show_dots BOOLEAN NOT NULL DEFAULT TRUE,
  show_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
  show_share BOOLEAN NOT NULL DEFAULT TRUE,
  show_like BOOLEAN NOT NULL DEFAULT TRUE,
  add_to_cart_mode TEXT NOT NULL DEFAULT 'redirect',
  store_url TEXT NOT NULL DEFAULT ''
);

-- RLS: desabilitar para service_role ter acesso total
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (para o widget no frontend)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_videos" ON public.videos
  FOR SELECT USING (true);

CREATE POLICY "allow_public_read_settings" ON public.settings
  FOR SELECT USING (true);
