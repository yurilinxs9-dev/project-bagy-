'use client'

import React, { useState, useEffect, useRef } from 'react'
import { VideoItem, WidgetSettings } from '@/types'
import { ProductCard } from './ProductCard'

interface VideoSlideProps {
  video: VideoItem
  settings: WidgetSettings
  isActive: boolean
  index: number
  showVideo?: boolean
  onVideoClick: (index: number) => void
  onVideoEnded: () => void
  previewMode?: boolean
  videoPreload?: 'none' | 'metadata'
}

/**
 * Otimiza poster manual do Cloudinary: adiciona f_auto,q_auto,w_400
 */
function optimizePosterUrl(url: string): string {
  if (!url) return ''
  const m = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/
  )
  if (!m) return url
  return `${m[1]}f_auto,q_auto,w_400/${m[2]}`
}

/**
 * Gera thumbnail do próprio vídeo Cloudinary no instante 0.5s.
 * Funciona para qualquer vídeo MP4/WebM em res.cloudinary.com.
 * Ex: .../video/upload/v1/foo.mp4 → .../video/upload/so_0.5,f_jpg,q_auto,w_400/v1/foo.jpg
 */
function generatePosterFromVideoUrl(videoUrl: string): string {
  if (!videoUrl) return ''
  const m = videoUrl.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*)\.[^.]+$/
  )
  if (!m) return ''
  return `${m[1]}so_0.5,f_jpg,q_auto,w_400/${m[2]}.jpg`
}

export function VideoSlide({
  video,
  settings,
  isActive,
  index,
  showVideo = false,
  onVideoClick,
  onVideoEnded,
  previewMode = false,
  videoPreload = 'none',
}: VideoSlideProps) {
  const [posterVisible, setPosterVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  // Rastreia se canplay já disparou neste ciclo de vida — permite que onPlay
  // esconda o poster em retomadas sem esconder antes do primeiro frame estar pronto.
  const isReadyRef = useRef(false)

  useEffect(() => {
    if (showVideo) {
      setPosterVisible(true)
      setIsLoading(true)
      isReadyRef.current = false
    }
  }, [showVideo])

  // Primeiro frame disponível: marca pronto e esconde poster
  const handleVideoCanPlay = () => {
    isReadyRef.current = true
    setIsLoading(false)
    setPosterVisible(false)
  }

  // Retomada após pausa: esconde poster se vídeo já estiver pronto
  // (canplay não re-dispara em retomadas — por isso precisamos do onPlay)
  const handleVideoPlay = () => {
    if (isReadyRef.current) setPosterVisible(false)
  }

  // Pausa: mostra poster/thumbnail de volta
  const handleVideoPause = () => {
    setPosterVisible(true)
  }

  const handleVideoWaiting = () => setIsLoading(true)

  const handleVideoError = () => {
    setPosterVisible(true)
    setIsLoading(false)
  }

  const handleSlideClick = () => {
    if (!previewMode) onVideoClick(index)
  }

  // Poster efetivo: manual (otimizado) ou thumbnail gerado do vídeo Cloudinary
  const manualPoster = optimizePosterUrl(video.posterUrl)
  const generatedPoster = !video.posterUrl
    ? generatePosterFromVideoUrl(video.videoUrl)
    : ''
  const effectivePoster = manualPoster || generatedPoster

  const overlayOpacity = posterVisible || !showVideo ? 1 : 0

  return (
    <div
      className="vcw-slide-inner"
      style={{ cursor: previewMode ? 'default' : 'pointer' }}
      onClick={handleSlideClick}
    >
      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#1a1a1a' }}>

        <div style={{ position: 'relative', paddingTop: '177.78%' }}>

          {/* Camada 1 — gradiente de fundo (fallback sempre visível) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              opacity: overlayOpacity,
              transition: 'opacity 300ms ease',
              pointerEvents: 'none',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>

          {/* Camada 2 — poster (manual ou thumbnail gerado) sobre o gradiente */}
          {effectivePoster && (
            <img
              src={effectivePoster}
              alt={video.product.name}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transition: 'opacity 300ms ease',
                opacity: overlayOpacity,
                zIndex: 2,
                pointerEvents: 'none',
              }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}

          {/* Camada 3 — vídeo (renderizado apenas nos slides active±1) */}
          {showVideo && (
            <video
              src={video.videoUrl}
              poster={effectivePoster || undefined}
              muted
              playsInline
              preload={videoPreload}
              loop
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onWaiting={handleVideoWaiting}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              onEnded={onVideoEnded}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                zIndex: 0,
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Spinner — slide ativo enquanto carrega */}
          {isActive && isLoading && showVideo && !previewMode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '3px solid rgba(255,255,255,0.25)',
                  borderTopColor: 'rgba(255,255,255,0.85)',
                  borderRadius: '50%',
                  animation: 'vcw-spin 0.75s linear infinite',
                }}
              />
            </div>
          )}
        </div>

        <ProductCard
          product={video.product}
          accentColor={settings.accentColor}
          onClick={
            previewMode
              ? undefined
              : () => window.open(video.product.url, '_blank', 'noopener,noreferrer')
          }
        />
      </div>
    </div>
  )
}
