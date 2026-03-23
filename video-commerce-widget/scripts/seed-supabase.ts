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

  console.log('Populando Supabase...')

  // Seed videos
  const { data: existingVideos } = await supabase.from('videos').select('id').limit(1)
  if (existingVideos && existingVideos.length > 0) {
    console.log('Videos ja existem -- pulando')
  } else {
    const rows = videos.map((v, i) => ({
      id: v.id,
      video_url: v.videoUrl,
      poster_url: v.posterUrl,
      product_name: v.product.name,
      product_price: v.product.price,
      product_image: v.product.image,
      product_url: v.product.url,
      whatsapp: v.whatsapp ?? null,
      sort_order: i,
    }))
    const { error } = await supabase.from('videos').insert(rows)
    if (error) {
      console.error('Erro ao inserir videos:', error.message)
      console.log('Execute o SQL de setup primeiro: npm run setup-db')
    } else {
      console.log(`${rows.length} videos inseridos`)
    }
  }

  // Seed settings
  const { data: existingSettings } = await supabase.from('settings').select('id').eq('id', 1).single()
  if (existingSettings) {
    console.log('Settings ja existem -- pulando')
  } else {
    const { error } = await supabase.from('settings').insert({
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
    })
    if (error) {
      console.error('Erro ao inserir settings:', error.message)
    } else {
      console.log('Settings inseridas')
    }
  }

  console.log('\nSeed concluido!')
}

seed().catch(console.error)
