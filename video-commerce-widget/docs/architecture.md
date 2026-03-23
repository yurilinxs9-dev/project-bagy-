# Arquitetura — Video Commerce Widget
**Versão:** 1.0
**Data:** 2026-03-23
**Status:** Aprovado
**Autor:** Orion (Orchestrator) / Aria (Architect)

---

## 1. Visão Geral

Widget de video commerce embeddable, construído como aplicação Next.js com build standalone para embed via script tag. Arquitetura de duas camadas: **Next.js App** (demo + desenvolvimento) e **Widget Bundle** (produção embed).

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (hosting)                   │
│  ┌─────────────────┐    ┌────────────────────────┐  │
│  │  Next.js App    │    │   /public/widget.js     │  │
│  │  (demo page)    │    │   (standalone bundle)   │  │
│  └────────┬────────┘    └──────────┬─────────────┘  │
│           │                        │                  │
│  ┌────────▼────────────────────────▼─────────────┐  │
│  │          React Components + Hooks              │  │
│  │   VideoShowcase → VideoCarousel → VideoSlide   │  │
│  │   FullscreenPlayer → ProgressBars → Actions    │  │
│  └─────────────────────────────────────────────── ┘  │
└─────────────────────────────────────────────────────┘
         │                              │
    ┌────▼────┐                  ┌──────▼──────┐
    │ videos  │                  │  Cloudinary  │
    │ .json   │                  │  (MP4/JPG)   │
    └─────────┘                  └─────────────┘
```

---

## 2. Stack Técnica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| Framework | Next.js | 14+ | App Router, otimizações built-in |
| UI | React | 18+ | Concurrent features, hooks |
| Estilização | Tailwind CSS | 3+ | Utility-first, purge em produção |
| Carrossel | Swiper.js | 11+ | Loop real, touch nativo, React wrapper |
| Build Widget | esbuild | latest | Bundle ultra-rápido, < 50KB output |
| Hosting | Vercel | free | Deploy automático, CDN global |
| Vídeos | Cloudinary | free | 25GB, URLs diretas MP4 |
| Dados | JSON estático | — | Zero backend, editável sem código |

---

## 3. Estrutura de Pastas

```
video-commerce-widget/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Demo page (preview do widget)
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Estilos globais + Tailwind
│   ├── components/
│   │   ├── VideoShowcase.tsx     # Container principal
│   │   ├── VideoCarousel.tsx     # Swiper wrapper
│   │   ├── VideoSlide.tsx        # Slide individual
│   │   ├── ProductCard.tsx       # Card no carrossel
│   │   ├── FullscreenPlayer.tsx  # Player stories overlay
│   │   ├── FullscreenActions.tsx # Botões: curtir, WhatsApp, share
│   │   ├── FullscreenProduct.tsx # Card produto no fullscreen
│   │   ├── ProgressBars.tsx      # Barras de progresso
│   │   └── NavigationArrows.tsx  # Setas desktop
│   ├── hooks/
│   │   ├── useVideoControl.ts    # play/pause/reset lógica
│   │   ├── useFullscreen.ts      # Estado fullscreen
│   │   ├── useSwipeGesture.ts    # Touch gesture detection
│   │   └── useIntersection.ts    # IntersectionObserver
│   ├── types/
│   │   └── index.ts              # VideoItem, WidgetConfig
│   ├── data/
│   │   └── videos.json           # Config + dados dos vídeos
│   ├── utils/
│   │   ├── formatPrice.ts        # Formatação de preço
│   │   └── whatsapp.ts           # Geração de URL WhatsApp
│   └── widget/
│       ├── embed.tsx             # React entry point standalone
│       └── mount.ts              # Script DOM mount
├── public/
│   └── widget.js                 # Bundle final (output do build)
├── scripts/
│   └── build-widget.js           # esbuild config
├── docs/                         # Documentação AIOX
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Fluxo de Dados

```
videos.json
    │
    ▼
VideoShowcase (estado global: activeIndex, isFullscreen, likedIds)
    ├── VideoCarousel
    │       ├── VideoSlide[0] ── ProductCard
    │       ├── VideoSlide[1] ── ProductCard  ← activeIndex
    │       └── VideoSlide[n] ── ProductCard
    │
    └── FullscreenPlayer (quando isFullscreen=true)
            ├── ProgressBars
            ├── <video> (com som)
            ├── FullscreenActions (like/whatsapp/share)
            └── FullscreenProduct
```

---

## 5. Componentes — Responsabilidades

### VideoShowcase.tsx
- Carrega `videos.json`
- Estado: `activeIndex`, `isFullscreen`, `fullscreenIndex`, `likedIds`
- Orquestra comunicação entre carrossel e fullscreen
- Callbacks: `onSlideChange`, `onVideoClick`, `onClose`

### VideoCarousel.tsx
- Wrapper do Swiper.js
- Recebe `videos`, `activeIndex`, `onSlideChange`, `onVideoClick`
- Config Swiper: `centeredSlides`, `loop`, `slidesPerView: 'auto'`
- Expõe ref do Swiper para controle externo
- Gerencia autoplay de vídeos via `watchSlidesProgress`

### VideoSlide.tsx
- `<video>` nativo: `muted`, `playsinline`, `preload="none"`, `data-src`
- Poster `<img>` com fade-out ao iniciar vídeo
- Ícone play (visível só no slide ativo)
- `ProductCard` na base
- Clique no vídeo → dispara `onVideoClick(index)`

### FullscreenPlayer.tsx
- Overlay fullscreen com `backdrop-blur`
- Gerencia `currentIndex` interno
- `<video>` com som, autoplay
- Evento `onEnded` → próximo vídeo
- Keyboard listener: ArrowLeft, ArrowRight, Escape
- Touch: detecta swipe horizontal > 50px

### ProgressBars.tsx
- Array de barras (uma por vídeo)
- Passadas: 100% branco
- Atual: animação CSS `width: 0 → 100%` pela duração do vídeo
- Futuras: fundo transparente/cinza

### useVideoControl.ts
- `play(ref)`, `pause(ref)`, `reset(ref)`
- Gerencia qual vídeo está ativo
- Integração com IntersectionObserver

### useSwipeGesture.ts
- `touchstart` → registra X inicial
- `touchend` → calcula delta, dispara `onSwipeLeft`/`onSwipeRight` se > 50px
- Threshold configurável

---

## 6. Widget Bundle

### Strategy
```
src/widget/mount.ts
    │
    ▼ esbuild
public/widget.js (~50KB gzipped)
    │
    ├── React + ReactDOM (embutidos)
    ├── Componentes compilados
    ├── CSS injetado via <style> tag
    └── Swiper CSS via link inject
```

### mount.ts — Fluxo
```typescript
// 1. Encontra ou cria elemento root
const root = document.getElementById('video-commerce-widget')
// 2. Injeta Swiper CSS via <link>
injectSwiperCSS()
// 3. Fetch config (mesmo domínio Vercel ou inline)
const config = await fetchConfig()
// 4. Monta React app
ReactDOM.createRoot(root).render(<VideoShowcase config={config} />)
```

### Isolamento de Estilos
- Prefixo CSS: `.vcw-` em todas as classes Tailwind customizadas
- Alternativa: Shadow DOM para isolamento completo
- Estratégia escolhida: **namespace CSS** (melhor compatibilidade)

---

## 7. Configuração Swiper

```javascript
{
  slidesPerView: 'auto',
  centeredSlides: true,
  loop: true,
  loopAdditionalSlides: videos.length,
  initialSlide: Math.floor(videos.length / 2),
  speed: 550,
  spaceBetween: 10,
  grabCursor: true,
  watchSlidesProgress: true,
  autoplay: { delay: 8000, disableOnInteraction: false },
  on: {
    slideChange: handleSlideChange,
    progress: handleProgress  // para scale/opacity
  }
}
```

### CSS Visual dos Slides
```css
.swiper-slide {
  width: 170px;     /* mobile */
  transition: transform 500ms cubic-bezier(.22,.68,0,1),
              opacity 500ms;
  transform: scale(0.92);
  opacity: 0.72;
}
.swiper-slide-active {
  transform: scale(1);
  opacity: 1;
  box-shadow: 0 6px 24px rgba(0,0,0,.13);
}
.swiper-slide-prev,
.swiper-slide-next {
  opacity: 0.82;
}
@media (min-width: 769px) { .swiper-slide { width: 205px; } }
@media (min-width: 1025px) { .swiper-slide { width: 240px; } }
```

---

## 8. Performance — Decisões Técnicas

| Decisão | Justificativa |
|---------|---------------|
| `preload="none"` + `data-src` | Não carrega vídeos até necessário |
| Apenas ativo + 2 vizinhos | Reduz requests simultâneos |
| Swiper via CDN | Remove ~60KB do bundle |
| esbuild para bundle | 10x mais rápido que webpack |
| IntersectionObserver | Pausa quando fora da tela (battery) |
| `loading="lazy"` em imagens | Defer imagens fora da viewport |

---

## 9. Deploy

### Vercel (Hosting)
```
GitHub push → Vercel CI/CD → Deploy automático
URL: https://video-commerce-widget.vercel.app
Widget: https://video-commerce-widget.vercel.app/widget.js
```

### Cloudinary (Vídeos)
```
Upload: Dashboard Cloudinary ou API
URL pattern: https://res.cloudinary.com/{cloud_name}/video/upload/v1/{filename}.mp4
Poster: https://res.cloudinary.com/{cloud_name}/image/upload/v1/{filename}.jpg
```

### Bagy (Instalação)
```html
<!-- Editor Visual > Mais ações > Editor avançado > Adicionar seção > HTML -->
<div id="video-commerce-widget"></div>
<script src="https://video-commerce-widget.vercel.app/widget.js"></script>
```

---

## 10. Tipos TypeScript

```typescript
interface VideoItem {
  id: string;
  videoUrl: string;
  posterUrl: string;
  product: {
    name: string;
    price: string;
    image: string;
    url: string;
  };
  whatsapp?: string;
}

interface WidgetConfig {
  videos: VideoItem[];
  settings: {
    whatsappDefault: string;
    accentColor: string;
    autoplay: boolean;
    autoplayDelay: number;
    showArrows: boolean;
    showDots: boolean;
    showWhatsapp: boolean;
    showShare: boolean;
    showLike: boolean;
    addToCartMode: 'redirect';
    storeUrl: string;
  };
}
```

---

*Arquitetura gerada via AIOX — Synkra Framework v2.0*
