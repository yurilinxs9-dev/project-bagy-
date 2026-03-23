import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function seed() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const videosData = await import('../src/data/videos.json')
  const { videos, settings } = videosData

  console.log('Populando Supabase com UPSERT...')

  // Upsert videos (atualiza existentes ou insere novos)
  const rows = videos.map((v, i) => ({
    id: v.id,
    video_url: v.videoUrl,
    poster_url: v.posterUrl,
    product_name: v.product.name,
    product_price: v.product.price,
    product_image: v.product.image,
    product_url: v.product.url,
    whatsapp: (v as { whatsapp?: string }).whatsapp ?? null,
    sort_order: i,
    updated_at: new Date().toISOString(),
  }))

  const { error: videoError } = await supabase
    .from('videos')
    .upsert(rows, { onConflict: 'id' })

  if (videoError) {
    console.error('Erro ao fazer upsert de videos:', videoError.message)
  } else {
    console.log(`${rows.length} videos inseridos/atualizados`)
  }

  // Upsert settings
  const { error: settingsError } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      whatsapp_default: settings.whatsappDefault,
      accent_color: settings.accentColor,
      autoplay: settings.autoplay,
      autoplay_delay: settings.autoplayDelay,
      show_arrows: settings.showArrows,
      show_dots: settings.showDots,
      show_whatsapp: settings.showWhatsapp,
      show_share: settings.showShare,
      show_like: settings.showLike,
      add_to_cart_mode: settings.addToCartMode,
      store_url: settings.storeUrl,
    }, { onConflict: 'id' })

  if (settingsError) {
    console.error('Erro ao fazer upsert de settings:', settingsError.message)
  } else {
    console.log('Settings atualizadas')
  }

  console.log('\nSeed concluido!')
}

seed().catch(console.error)
