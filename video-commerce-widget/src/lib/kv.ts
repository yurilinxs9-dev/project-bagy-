import { supabaseAdmin } from './supabase'
import { VideoItem, WidgetSettings } from '@/types'
import videosJson from '@/data/videos.json'

// ── Vídeos ────────────────────────────────────────────────────────────────────

export async function getVideos(): Promise<VideoItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      videoUrl: row.video_url as string,
      posterUrl: row.poster_url as string,
      product: {
        name: row.product_name as string,
        price: row.product_price as string,
        image: row.product_image as string,
        url: row.product_url as string,
      },
      whatsapp: row.whatsapp as string | undefined,
    }))
  } catch {
    return videosJson.videos as VideoItem[]
  }
}

export async function setVideos(videos: VideoItem[]): Promise<void> {
  // Delete all then insert — abordagem simples para manter ordem
  await supabaseAdmin.from('videos').delete().neq('id', '')

  if (videos.length === 0) return

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
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabaseAdmin.from('videos').insert(rows)
  if (error) throw error
}

export async function addVideo(video: VideoItem): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from('videos')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = existing ? (existing.sort_order as number) + 1 : 0

  const { error } = await supabaseAdmin.from('videos').insert({
    id: video.id,
    video_url: video.videoUrl,
    poster_url: video.posterUrl,
    product_name: video.product.name,
    product_price: video.product.price,
    product_image: video.product.image,
    product_url: video.product.url,
    whatsapp: video.whatsapp ?? null,
    sort_order: nextOrder,
  })
  if (error) throw error
}

export async function updateVideo(id: string, updates: Partial<VideoItem>): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.videoUrl) row.video_url = updates.videoUrl
  if (updates.posterUrl) row.poster_url = updates.posterUrl
  if (updates.product) {
    row.product_name = updates.product.name
    row.product_price = updates.product.price
    row.product_image = updates.product.image
    row.product_url = updates.product.url
  }
  if (updates.whatsapp !== undefined) row.whatsapp = updates.whatsapp

  const { error } = await supabaseAdmin.from('videos').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('videos').delete().eq('id', id)
  if (error) throw error
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<WidgetSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) throw error ?? new Error('not found')

    const row = data as Record<string, unknown>
    return {
      whatsappDefault: row.whatsapp_default as string,
      accentColor: row.accent_color as string,
      autoplay: row.autoplay as boolean,
      autoplayDelay: row.autoplay_delay as number,
      showArrows: row.show_arrows as boolean,
      showDots: row.show_dots as boolean,
      showWhatsapp: row.show_whatsapp as boolean,
      showShare: row.show_share as boolean,
      showLike: row.show_like as boolean,
      addToCartMode: 'redirect',
      storeUrl: row.store_url as string,
    }
  } catch {
    return videosJson.settings as WidgetSettings
  }
}

export async function setSettings(settings: WidgetSettings): Promise<void> {
  const { error } = await supabaseAdmin.from('settings').upsert({
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
  if (error) throw error
}
