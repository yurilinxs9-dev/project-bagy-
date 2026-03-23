'use client'

import { useRef, useCallback } from 'react'

export function useVideoControl() {
  const containerRef = useRef<HTMLElement | null>(null)

  const setContainer = useCallback((el: HTMLElement | null) => {
    containerRef.current = el
  }, [])

  /** Toca todos os vídeos visíveis no container (inclui slides clonados do Swiper loop) */
  const playAll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      if (v.paused) {
        v.play().catch(() => {
          // autoplay bloqueado — silencioso
        })
      }
    })
  }, [])

  /** Pausa todos os vídeos no container */
  const pauseAll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      if (!v.paused) v.pause()
    })
  }, [])

  return { setContainer, playAll, pauseAll }
}
