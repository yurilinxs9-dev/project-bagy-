import React from 'react'
import ReactDOM from 'react-dom/client'
import { Embed } from './embed'

declare global {
  interface Window {
    __VIDEO_WIDGET_CONFIG__?: import('../types').WidgetConfig
    __VIDEO_WIDGET_API_URL__?: string
    __VIDEO_WIDGET_STORE__?: string
  }
}

function injectSwiperCSS() {
  if (document.querySelector('link[data-vcw-swiper]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
  link.setAttribute('data-vcw-swiper', 'true')
  document.head.appendChild(link)
}

async function loadConfig() {
  // Prioridade 1: config inline
  if (window.__VIDEO_WIDGET_CONFIG__) {
    return window.__VIDEO_WIDGET_CONFIG__
  }
  // Prioridade 2: fetch da API
  const apiUrl = window.__VIDEO_WIDGET_API_URL__ ?? ''
  const store = window.__VIDEO_WIDGET_STORE__
  const storeParam = store ? `?store=${encodeURIComponent(store)}` : ''
  try {
    const [videosRes, settingsRes] = await Promise.all([
      fetch(`${apiUrl}/api/videos${storeParam}`),
      fetch(`${apiUrl}/api/settings${storeParam}`),
    ])
    const videos = await videosRes.json()
    const settings = await settingsRes.json()
    return { videos, settings }
  } catch {
    return null
  }
}

async function mount() {
  let root = document.getElementById('video-commerce-widget')
  if (!root) {
    root = document.createElement('div')
    root.id = 'video-commerce-widget'
    document.body.appendChild(root)
  }

  injectSwiperCSS()

  let config
  try {
    config = await loadConfig()
  } catch (e) {
    console.error('[VideoWidget] Falha ao carregar configuração:', e)
    return
  }

  ReactDOM.createRoot(root).render(
    React.createElement(Embed, { config: config ?? undefined })
  )
}

mount()
