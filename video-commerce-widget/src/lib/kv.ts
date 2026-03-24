import { supabaseAdmin } from './supabase'
import { VideoItem, WidgetSettings, Store } from '@/types'
import videosJson from '@/data/videos.json'

// ── Helper: resolve store id from slug ────────────────────────────────────────

async function getStoreId(slug: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .single()
  return (data as Record<string, string> | null)?.id ?? null
}

// ── Stores ─────────────────────────────────────────────────────────────────────

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    storeUrl: row.store_url as string,
    createdAt: row.created_at as string,
  }))
}

export async function addStore(
  store: Omit<Store, 'id' | 'createdAt'>
): Promise<Store> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .insert({
      name: store.name,
      slug: store.slug,
      store_url: store.storeUrl,
    })
    .select()
    .single()

  if (error) throw error
  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    storeUrl: row.store_url as string,
    createdAt: row.created_at as string,
  }
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!data) return null
  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    storeUrl: row.store_url as string,
    createdAt: row.created_at as string,
  }
}

// ── Vídeos ─────────────────────────────────────────────────────────────────────

export async function getVideos(storeSlug?: string): Promise<VideoItem[]> {
  try {
    let query = supabaseAdmin
      .from('videos')
      .select('*')
      .order('sort_order', { ascending: true })

    if (storeSlug) {
      const storeId = await getStoreId(storeSlug)
      if (!storeId) return []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).eq('store_id', storeId)
    }

    const { data, error } = await query
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

export async function addVideo(
  video: VideoItem,
  storeSlug?: string
): Promise<void> {
  let storeId: string | null = null
  if (storeSlug) {
    storeId = await getStoreId(storeSlug)
  }

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
    store_id: storeId,
  })
  if (error) throw error
}

export async function updateVideo(
  id: string,
  updates: Partial<VideoItem>
): Promise<void> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
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

export async function reorderVideos(videoIds: string[]): Promise<void> {
  for (let i = 0; i < videoIds.length; i++) {
    await supabaseAdmin
      .from('videos')
      .update({ sort_order: i })
      .eq('id', videoIds[i])
  }
}

// ── Settings ───────────────────────────────────────────────────────────────────

export async function getSettings(storeSlug?: string): Promise<WidgetSettings> {
  try {
    let row: Record<string, unknown> | null = null

    if (storeSlug) {
      const storeId = await getStoreId(storeSlug)
      if (!storeId) throw new Error('Store not found')
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('store_id', storeId)
        .single()
      if (error) throw error
      row = data as Record<string, unknown>
    } else {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()
      if (error) throw error
      row = data as Record<string, unknown>
    }

    if (!row) throw new Error('not found')

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

export async function setSettings(
  settings: WidgetSettings,
  storeSlug?: string
): Promise<void> {
  if (storeSlug) {
    const storeId = await getStoreId(storeSlug)
    if (!storeId) throw new Error('Store not found')

    const { error } = await supabaseAdmin.from('settings').upsert(
      {
        store_id: storeId,
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
      },
      { onConflict: 'store_id' }
    )
    if (error) throw error
  } else {
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
}
