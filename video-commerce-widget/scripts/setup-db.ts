import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const SQL = `
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

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='videos' AND policyname='allow_public_read_videos'
  ) THEN
    CREATE POLICY "allow_public_read_videos" ON public.videos FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='settings' AND policyname='allow_public_read_settings'
  ) THEN
    CREATE POLICY "allow_public_read_settings" ON public.settings FOR SELECT USING (true);
  END IF;
END $$;
`

async function setupDb() {
  console.log('Criando tabelas no Supabase...')
  console.log(`URL: ${SUPABASE_URL}`)

  // Tenta via REST API (abordagem 1: rpc/query)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: SQL }),
    })
    if (res.ok) {
      console.log('Tabelas criadas via rpc/query')
      return
    }
    console.log(`   rpc/query: ${res.status} ${res.statusText}`)
  } catch (e) {
    console.log(`   rpc/query falhou: ${e}`)
  }

  // Tenta via REST API (abordagem 2: rpc/exec_sql)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: SQL }),
    })
    if (res.ok) {
      console.log('Tabelas criadas via rpc/exec_sql')
      return
    }
    console.log(`   rpc/exec_sql: ${res.status} ${res.statusText}`)
  } catch (e) {
    console.log(`   rpc/exec_sql falhou: ${e}`)
  }

  // Abordagem 3: Verificar se tabelas já existem e pular
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabase.from('videos').select('id').limit(1)
    if (!error) {
      console.log('Tabelas ja existem no Supabase!')
      return
    }
  } catch {
    // ignore
  }

  console.log('\n[AVISO] Nao foi possivel criar tabelas via API automaticamente.')
  console.log('Execute o seguinte SQL no Supabase Dashboard > SQL Editor:')
  console.log('\n' + SQL)
  console.log('\n-> Acesse: https://supabase.com/dashboard/project/mtnexobbwttwtpvfnnos/sql/new')
}

setupDb().catch(console.error)
