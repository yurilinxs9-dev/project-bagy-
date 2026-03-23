# PRD — Video Commerce Widget
**Versão:** 1.0
**Data:** 2026-03-23
**Status:** Aprovado
**Autor:** Morgan (PM Agent) via Orion (Orchestrator)

---

## 1. Visão Geral do Produto

### 1.1 Problema
Lojistas de e-commerce (especialmente em plataformas como Bagy, Shopify, Nuvemshop) não possuem uma solução nativa de video commerce — a apresentação de produtos via vídeo curto no estilo "stories" que aumenta conversão. Soluções como Widde existem mas são SaaS caros ou exigem integrações complexas.

### 1.2 Solução
Um **widget embeddable de video commerce** que o lojista instala com 2 linhas de HTML, configurável via JSON, hospedado gratuitamente no Vercel, com vídeos no Cloudinary. Visual premium estilo Instagram Stories/Widde, funcionando em qualquer plataforma que aceite HTML.

### 1.3 Usuários-Alvo
- **Primário:** Lojistas de pequenas e médias lojas virtuais (Bagy, Shopify, Nuvemshop)
- **Secundário:** Agências digitais que gerenciam múltiplas lojas

### 1.4 Proposta de Valor
> "Instale em 2 minutos, venda com vídeo como os grandes."

---

## 2. Objetivos e Métricas de Sucesso

### Objetivos
- [ ] Widget funcionando na loja Bagy: `julia-gonitjo-pijamas.bagypro.com`
- [ ] Tempo de instalação < 5 minutos para o lojista
- [ ] Carregamento < 3 segundos em mobile 3G
- [ ] Visual indistinguível de soluções premium (Widde, LV Store)

### Métricas de Sucesso
| Métrica | Meta |
|---------|------|
| Tempo de carregamento inicial (mobile) | < 3s |
| Bundle size (gzipped, sem Swiper CDN) | < 50KB |
| Tempo de instalação pelo lojista | < 5 min |
| Cobertura responsiva | Mobile + Desktop |
| Videos simultâneos ativos | Apenas 1 |

---

## 3. Requisitos Funcionais

### FR-1: Carrossel de Vídeos
- **FR-1.1** Carrossel horizontal com slides verticais (9:16 / stories)
- **FR-1.2** Slide ativo centralizado, levemente maior (scale + sombra)
- **FR-1.3** Slides laterais parcialmente visíveis dos dois lados
- **FR-1.4** Larguras responsivas: Mobile 170px | Tablet 205px | Desktop 240px
- **FR-1.5** Loop infinito real (sem reset brusco)
- **FR-1.6** Autoplay do vídeo ativo (mutado)
- **FR-1.7** Pausa automática de todos os outros vídeos
- **FR-1.8** Avanço automático ao terminar o vídeo (`slideNext()`)
- **FR-1.9** Setas de navegação desktop
- **FR-1.10** Swipe nativo no mobile
- **FR-1.11** IntersectionObserver: pausa tudo quando fora da viewport

### FR-2: Card de Produto no Carrossel
- **FR-2.1** Thumbnail do produto (40x40px)
- **FR-2.2** Nome do produto (truncado, 11.5px)
- **FR-2.3** Preço formatado (bold, 12.5px)
- **FR-2.4** Ícone de sacola (círculo accent, 26px)
- **FR-2.5** Clique no card → redireciona para página do produto

### FR-3: Player Fullscreen (Stories)
- **FR-3.1** Abre ao clicar no vídeo do carrossel
- **FR-3.2** Formato stories: max-width 400px desktop, 100% mobile
- **FR-3.3** Barras de progresso no topo (uma por vídeo)
- **FR-3.4** Vídeo com **som ativado** (não mutado)
- **FR-3.5** Autoplay ao abrir
- **FR-3.6** Ao terminar vídeo → avança para próximo
- **FR-3.7** Último vídeo → volta para primeiro (loop)
- **FR-3.8** Overlay escuro semi-transparente com blur

### FR-4: Navegação no Fullscreen
- **FR-4.1** Touch areas (28% esquerda/direita): prev/next
- **FR-4.2** Swipe horizontal (>50px): prev/next
- **FR-4.3** Teclado: ArrowLeft, ArrowRight, Escape
- **FR-4.4** Botão X (top-right, 32px): fecha fullscreen

### FR-5: Botões de Ação no Fullscreen
- **FR-5.1** Curtir: toggle visual (fill accent quando ativo)
- **FR-5.2** WhatsApp: abre `wa.me/{numero}?text={mensagem com nome+preço}`
- **FR-5.3** Compartilhar: `navigator.share()` nativo + fallback `clipboard.writeText()`

### FR-6: Card de Produto no Fullscreen
- **FR-6.1** Gradient overlay inferior (transparent → rgba(0,0,0,.78))
- **FR-6.2** Thumbnail 44x44px
- **FR-6.3** Nome (12px semibold, branco, ellipsis)
- **FR-6.4** Preço (13px bold, branco)
- **FR-6.5** Botão "Adicionar produto" → `window.location.href` para página do produto

### FR-7: Sistema de Dados
- **FR-7.1** Configuração via `videos.json` (editável sem código)
- **FR-7.2** Suporte a múltiplos vídeos (mínimo 7, sem limite máximo)
- **FR-7.3** WhatsApp por vídeo ou padrão global
- **FR-7.4** Cor de destaque configurável (`accentColor`)
- **FR-7.5** Toggles para cada feature (whatsapp, share, like, arrows, dots)

### FR-8: Widget Embeddable
- **FR-8.1** Instalação com 2 linhas de HTML:
  ```html
  <div id="video-commerce-widget"></div>
  <script src="https://SEU-APP.vercel.app/widget.js"></script>
  ```
- **FR-8.2** Bundle único auto-contido (React + ReactDOM embutidos)
- **FR-8.3** Isolamento de estilos (namespace CSS ou shadow DOM)
- **FR-8.4** Carrega Swiper CSS via inject dinâmico
- **FR-8.5** Compatível com Bagy, Shopify, Nuvemshop, qualquer HTML

---

## 4. Requisitos Não-Funcionais

### NFR-1: Performance
- **NFR-1.1** Bundle widget < 50KB gzipped (excluindo Swiper CDN)
- **NFR-1.2** Lazy load de vídeos: `preload="none"` + `data-src`
- **NFR-1.3** Apenas vídeo ativo + 2 vizinhos carregados
- **NFR-1.4** Imagens com `loading="lazy"`
- **NFR-1.5** Zero iframes no carrossel

### NFR-2: Compatibilidade
- **NFR-2.1** React 18+ com Next.js 14+ (App Router)
- **NFR-2.2** Tailwind CSS 3+
- **NFR-2.3** Swiper.js 11+ (React wrapper)
- **NFR-2.4** Suporte a Chrome, Firefox, Safari, Edge (últimas 2 versões)
- **NFR-2.5** iOS Safari e Chrome Android

### NFR-3: Manutenibilidade
- **NFR-3.1** Dados 100% externalizados em `videos.json`
- **NFR-3.2** Configuração sem necessidade de código
- **NFR-3.3** Deploy automático via GitHub → Vercel

---

## 5. Restrições e Premissas

### Restrições (CON)
- **CON-1** Infraestrutura 100% gratuita (Vercel free tier, Cloudinary free tier)
- **CON-2** Sem backend customizado (dados via JSON estático)
- **CON-3** Sem dependência de plataforma específica
- **CON-4** Swiper.js carregado via CDN (não incluir no bundle)
- **CON-5** `addToCartMode: 'redirect'` apenas (sem integração de carrinho nesta fase)

### Premissas
- Vídeos já existem no Cloudinary como MP4 diretos
- Lojista tem acesso ao editor HTML da plataforma
- Domínio Vercel configurado e disponível

---

## 6. Épicos e Stories

### Epic 1: Fundação do Projeto (Setup)
> Configurar Next.js, Tailwind, Swiper e estrutura de pastas

| Story | Título | Prioridade |
|-------|--------|-----------|
| 1.1 | Setup inicial Next.js + Tailwind + Swiper | Must |
| 1.2 | Estrutura de tipos TypeScript | Must |
| 1.3 | JSON de configuração e dados mock | Must |

### Epic 2: Carrossel de Vídeos
> Componente principal com Swiper, slides, autoplay e lazy load

| Story | Título | Prioridade |
|-------|--------|-----------|
| 2.1 | VideoCarousel com Swiper (estrutura base) | Must |
| 2.2 | VideoSlide com vídeo nativo + poster | Must |
| 2.3 | ProductCard no carrossel | Must |
| 2.4 | Autoplay, lazy load e IntersectionObserver | Must |
| 2.5 | Setas de navegação e responsividade | Should |

### Epic 3: Player Fullscreen
> Stories player com barras de progresso, ações e card de produto

| Story | Título | Prioridade |
|-------|--------|-----------|
| 3.1 | FullscreenPlayer (estrutura e overlay) | Must |
| 3.2 | ProgressBars animadas | Must |
| 3.3 | Navegação: touch, swipe, teclado | Must |
| 3.4 | FullscreenActions (curtir, WhatsApp, compartilhar) | Must |
| 3.5 | FullscreenProduct card e botão | Must |

### Epic 4: Widget Embeddable
> Build standalone, embed script e isolamento de estilos

| Story | Título | Prioridade |
|-------|--------|-----------|
| 4.1 | Entry point do widget (embed.tsx + mount.ts) | Must |
| 4.2 | Build script (esbuild/webpack) gerando widget.js | Must |
| 4.3 | Isolamento de estilos + inject Swiper CSS | Must |
| 4.4 | Página de demo e código de embed para Bagy | Must |

### Epic 5: Polish e Deploy
> Refinamentos visuais, performance final, deploy Vercel

| Story | Título | Prioridade |
|-------|--------|-----------|
| 5.1 | Refinamento visual (transições, sombras, scale) | Should |
| 5.2 | Testes de performance e otimização bundle | Should |
| 5.3 | Deploy Vercel + configuração Cloudinary | Must |
| 5.4 | README com instruções de instalação e uso | Must |

### Epic 6: Painel de Administração (/admin)
> Interface web para gerenciar vídeos, configurações e persistência via Vercel KV

| Story | Título | Prioridade |
|-------|--------|-----------|
| 6.1 | Auth: login com senha via variável de ambiente | Must |
| 6.2 | API Routes Next.js: CRUD /api/videos + /api/settings | Must |
| 6.3 | Integração Vercel KV: persistência de dados | Must |
| 6.4 | Widget lê dados da API em vez de JSON estático | Must |
| 6.5 | Admin Dashboard: lista de vídeos com thumbnail e status | Must |
| 6.6 | Admin: formulário adicionar/editar vídeo | Must |
| 6.7 | Admin: remover vídeo + reordenar por drag and drop | Must |
| 6.8 | Admin: configurações gerais (accent, WhatsApp, toggles) | Must |
| 6.9 | Admin: preview ao vivo do carrossel | Should |

---

## 7. Informações da Loja Piloto

| Campo | Valor |
|-------|-------|
| Plataforma | Bagy (bagypro.com) |
| URL | `julia-gonitjo-pijamas.bagypro.com` |
| CDN Imagens | `cdn.dooca.store/159193/` |
| WhatsApp | `5537999999999` |
| Cor Accent | `#c8344d` |

---

## 8. Fora do Escopo (Fase 1)

- ✅ Painel de administração → **incluído no Epic 6**
- ❌ Integração direta com carrinho (addToCart via API)
- ❌ Analytics de visualização
- ❌ A/B testing
- ❌ Múltiplos widgets por página
- ❌ Suporte a vídeos do YouTube/Vimeo (apenas MP4 direto)

---

*PRD gerado via AIOX — Synkra Framework v2.0*
