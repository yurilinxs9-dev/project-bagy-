import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ── Helpers de extração por regex ─────────────────────────────────────────────

function extractMeta(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  )
  const m = html.match(re) ||
    html.match(new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i'
    ))
  return m ? decode(m[1].trim()) : ''
}

function extractH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!m) return ''
  return decode(stripTags(m[1])).replace(/\s+/g, ' ').trim()
}

function extractPrice(html: string): string {
  // 1. class="total" dentro de product-price-final
  let m = html.match(/product-price-final[\s\S]{0,300}?class=["'][^"']*total[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)
  if (m) {
    const t = decode(stripTags(m[1])).replace(/\s+/g, ' ').trim()
    if (t) return t
  }
  // 2. itemprop="price" content=
  m = html.match(/itemprop=["']price["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]+itemprop=["']price["']/i)
  if (m) {
    const val = m[1].trim()
    if (val) return `R$ ${parseFloat(val).toFixed(2).replace('.', ',')}`
  }
  // 3. class contendo price-final ou price_final
  m = html.match(/class=["'][^"']*price[-_]final[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)
  if (m) {
    const t = decode(stripTags(m[1])).replace(/\s+/g, ' ').trim()
    if (t) return t
  }
  // 4. fallback: primeiro R$ XX no HTML
  m = html.match(/R\$\s*[\d.,]+/)
  return m ? m[0].trim() : ''
}

function extractImage(html: string, baseUrl: string): string {
  // 1. og:image
  let img = extractMeta(html, 'og:image')
  if (img) return img

  // 2. <img> cujo src contenha cdn.dooca.store ou "produto" ou "product"
  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1]
    if (
      !src.startsWith('data:') &&
      (src.includes('cdn.dooca') ||
        src.includes('produto') ||
        src.includes('product') ||
        src.includes('cdn.shopify') ||
        src.includes('vteximg'))
    ) {
      return src.startsWith('http') ? src : new URL(src, baseUrl).href
    }
  }

  // 3. data-src como fallback (lazy loading)
  const dataSrcRe = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/i
  const ds = html.match(dataSrcRe)
  if (ds && !ds[1].startsWith('data:')) {
    return ds[1].startsWith('http') ? ds[1] : new URL(ds[1], baseUrl).href
  }

  return ''
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { url?: string } = {}
  try { body = await req.json() } catch { /* json inválido */ }

  const { url } = body
  if (!url) {
    return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 502 })
    }
    html = await res.text()
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha no fetch' },
      { status: 500 }
    )
  }

  const name = extractH1(html) || extractMeta(html, 'og:title')
  const price = extractPrice(html)
  const image = extractImage(html, url)

  return NextResponse.json({
    name: name.replace(/\s+/g, ' ').trim(),
    price: price.replace(/\s+/g, ' ').trim(),
    image,
  })
}
