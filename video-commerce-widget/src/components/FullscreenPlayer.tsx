'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { VideoItem, WidgetSettings } from '@/types'
import { ProgressBars } from './ProgressBars'
import { FullscreenActions } from './FullscreenActions'
import { FullscreenProduct } from './FullscreenProduct'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

interface FullscreenPlayerProps {
  videos: VideoItem[]
  settings: WidgetSettings
  initialIndex: number
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  onClose: () => void
}

export function FullscreenPlayer({
  videos,
  settings,
  initialIndex,
  likedIds,
  onToggleLike,
  onClose,
}: FullscreenPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [videoDuration, setVideoDuration] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const total = videos.length

  const goNext = useCallback(() => setCurrentIndex((i) => (i + 1) % total), [total])
  const goPrev = useCallback(() => setCurrentIndex((i) => (i - 1 + total) % total), [total])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.src = videos[currentIndex].videoUrl
    video.load()
    video.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        const onCanPlay = () => {
          video.muted = true
          setIsMuted(true)
          video.play().then(() => setIsPlaying(true)).catch(() => {})
        }
        video.addEventListener('canplay', onCanPlay, { once: true })
      })
    return () => { video.pause(); setIsPlaying(false) }
  }, [currentIndex, videos])

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      if (dur && isFinite(dur)) setVideoDuration(dur)
    }
  }

  const handleUnmute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    setIsMuted(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onClose])

  const { onTouchStart, onTouchEnd } = useSwipeGesture(goNext, goPrev)
  const video = videos[currentIndex]
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 600

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          height: '100dvh',
          maxHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isDesktop ? 16 : 0,
          overflow: 'hidden',
          background: '#000',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Área do vídeo (flex:1 — ocupa todo espaço restante) ── */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, background: '#000' }}>

          {/* Barras de progresso */}
          <ProgressBars
            total={total}
            current={currentIndex}
            videoDuration={videoDuration}
            isPlaying={isPlaying}
          />

          {/* Vídeo principal */}
          <video
            ref={videoRef}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={goNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Áreas de toque: prev (esq 28%) e next (dir 28%) */}
          <div
            style={{ position: 'absolute', left: 0, top: 40, width: '28%', bottom: 0, zIndex: 8, cursor: 'pointer' }}
            onClick={goPrev}
          />
          <div
            style={{ position: 'absolute', right: 0, top: 40, width: '28%', bottom: 0, zIndex: 8, cursor: 'pointer' }}
            onClick={goNext}
          />

          {/* Botão unmute */}
          {isMuted && (
            <button
              onClick={handleUnmute}
              aria-label="Ativar som"
              style={{
                position: 'absolute', top: 12, left: 12, zIndex: 20,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Toque para ativar som
            </button>
          )}

          {/* Botão fechar */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 20,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontSize: 18, lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Botões de ação (lado direito do vídeo) */}
          <FullscreenActions
            video={video}
            settings={settings}
            isLiked={likedIds.has(video.id)}
            onToggleLike={() => onToggleLike(video.id)}
          />
        </div>

        {/* ── Card de produto (fora do vídeo, fluxo normal abaixo) ── */}
        <FullscreenProduct
          product={video.product}
          accentColor={settings.accentColor}
        />
      </div>
    </div>
  )
}
