-- ============================================================
-- MIGRAÇÃO MULTI-LOJA — Video Commerce Widget
-- Rodar no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar tabela stores
CREATE TABLE IF NOT EXISTS stores (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  slug       text        NOT NULL UNIQUE,
  store_url  text        NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Adicionar store_id na tabela videos
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;

-- 3. Adicionar store_id na tabela settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;

-- 4. Unique constraint em settings.store_id (necessário para upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settings_store_id_unique'
  ) THEN
    ALTER TABLE settings
      ADD CONSTRAINT settings_store_id_unique UNIQUE (store_id);
  END IF;
END $$;

-- 5. RLS na tabela stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stores_public_read" ON stores;
CREATE POLICY "stores_public_read" ON stores
  FOR SELECT USING (true);

-- 6. Inserir a primeira loja (Júlia Gontijo)
INSERT INTO stores (name, slug, store_url)
VALUES (
  'Júlia Gontijo Pijamas',
  'julia-gontijo',
  'https://julia-gonitjo-pijamas.bagypro.com'
)
ON CONFLICT (slug) DO NOTHING;

-- 7. Migrar vídeos existentes → loja julia-gontijo
UPDATE videos
SET store_id = (SELECT id FROM stores WHERE slug = 'julia-gontijo')
WHERE store_id IS NULL;

-- 8. Migrar settings existentes → loja julia-gontijo
UPDATE settings
SET store_id = (SELECT id FROM stores WHERE slug = 'julia-gontijo')
WHERE store_id IS NULL;

-- 9. Verificação final
SELECT 'stores'                AS tabela, COUNT(*) AS total FROM stores
UNION ALL
SELECT 'videos (total)',                  COUNT(*) FROM videos
UNION ALL
SELECT 'videos sem store_id',             COUNT(*) FROM videos   WHERE store_id IS NULL
UNION ALL
SELECT 'settings sem store_id',           COUNT(*) FROM settings WHERE store_id IS NULL;
