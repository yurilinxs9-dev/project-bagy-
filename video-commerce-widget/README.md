# Video Commerce Widget

Widget de video commerce embeddable no estilo Instagram Stories para lojas virtuais. Instale com **2 linhas de HTML** em qualquer plataforma (Bagy, Shopify, Nuvemshop, etc).

---

## Instalação em 2 minutos

Cole no editor HTML da sua plataforma (Bagy: Editor Visual → Mais ações → Editor avançado → Adicionar seção → HTML):

```html
<div id="video-commerce-widget"></div>
<script src="https://SEU-PROJETO.vercel.app/widget.js"></script>
```

---

## Desenvolvimento local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com sua senha e chaves do Vercel KV

# 3. Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000

# 4. Painel admin
# Acesse: http://localhost:3000/admin
```

---

## Configuração

### Sem painel admin (JSON estático)
Edite `src/data/videos.json` diretamente.

### Com painel admin (Vercel KV)
1. Acesse `/admin` com a senha definida em `ADMIN_PASSWORD`
2. Gerencie vídeos, ordem e configurações pela interface

---

## Setup Cloudinary (hospedagem de vídeos grátis)

1. Crie conta em [cloudinary.com](https://cloudinary.com) (25GB grátis)
2. Faça upload dos vídeos MP4 verticais (1080×1920 ideal)
3. Faça upload das imagens de poster
4. Copie as URLs diretas para o `videos.json` ou painel admin

Padrão de URL:
```
Vídeo:  https://res.cloudinary.com/{cloud}/video/upload/v1/{nome}.mp4
Poster: https://res.cloudinary.com/{cloud}/image/upload/v1/{nome}.jpg
```

---

## Deploy Vercel

```bash
# 1. Instalar Vercel CLI (opcional)
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente no dashboard Vercel:
#    ADMIN_PASSWORD, JWT_SECRET, KV_REST_API_URL, KV_REST_API_TOKEN

# 4. Criar Vercel KV:
#    Dashboard → Storage → Create Database → KV → Connect Project

# 5. Sincronizar env vars locais
vercel env pull .env.local

# 6. Popular o KV com dados iniciais
npm run seed
```

---

## Variáveis de ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `ADMIN_PASSWORD` | Senha do painel /admin | Sim (para admin) |
| `JWT_SECRET` | Chave secreta para JWT (min 32 chars) | Sim (para admin) |
| `KV_REST_API_URL` | URL do Vercel KV | Sim (para persistência) |
| `KV_REST_API_TOKEN` | Token do Vercel KV | Sim (para persistência) |

---

## Build do widget standalone

```bash
npm run build:widget
# Gera: public/widget.js
```

---

## Stack

- **Next.js 14** (App Router) — framework
- **React 18** — UI
- **Tailwind CSS 3** — estilização
- **Swiper.js 11** — carrossel
- **Vercel KV** — persistência
- **@dnd-kit** — drag and drop no admin
- **esbuild** — bundle do widget
- **Vercel** — hosting

---

## Loja piloto

[julia-gonitjo-pijamas.bagypro.com](https://julia-gonitjo-pijamas.bagypro.com)
