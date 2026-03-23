import { NextRequest, NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { url } = body as { url?: string }

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

  const dom = new JSDOM(html)
  const doc = dom.window.document

  // ── Nome ─────────────────────────────────────────────────────────────────────
  const name =
    doc.querySelector('h1')?.textContent?.trim() ||
    doc
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content')
      ?.trim() ||
    ''

  // ── Preço ─────────────────────────────────────────────────────────────────────
  // Tenta seletores comuns de plataformas BR
  const priceSelectors = [
    '.product-price-final .total',
    '.product-price-final',
    '.price-final',
    '[class*="price-final"]',
    '[class*="price_final"]',
    '.product__price',
    '[class*="product-price"]',
    '[itemprop="price"]',
  ]
  let price = ''
  for (const sel of priceSelectors) {
    const el = doc.querySelector(sel)
    if (el?.textContent?.trim()) {
      price = el.textContent.trim()
      break
    }
  }
  // Fallback: regex para R$ XX,XX no HTML
  if (!price) {
    const match = html.match(/R\$\s*[\d.,]+/)
    if (match) price = match[0].trim()
  }

  // ── Imagem ───────────────────────────────────────────────────────────────────
  // og:image é o mais confiável
  let image =
    doc
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content') || ''

  if (!image) {
    // Seletores para área do produto
    const imgSelectors = [
      '.product-image img',
      '.product__image img',
      '.swiper-slide img',
      '[class*="product-image"] img',
      '[class*="product-gallery"] img',
    ]
    for (const sel of imgSelectors) {
      const el = doc.querySelector(sel) as HTMLImageElement | null
      const src = el?.getAttribute('src') || el?.getAttribute('data-src') || ''
      if (src && !src.includes('data:image')) {
        image = src.startsWith('http') ? src : new URL(src, url).href
        break
      }
    }
  }

  return NextResponse.json({
    name: name.replace(/\s+/g, ' '),
    price: price.replace(/\s+/g, ' '),
    image,
  })
}
