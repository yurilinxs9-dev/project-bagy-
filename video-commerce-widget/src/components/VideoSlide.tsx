'use client'

import React, { useState, useEffect } from 'react'
import { VideoItem, WidgetSettings } from '@/types'
import { ProductCard } from './ProductCard'

interface VideoSlideProps {
  video: VideoItem
  settings: WidgetSettings
  isActive: boolean
  index: number
  /** Se true, renderiza o <video>. Se false, só exibe o poster (sem elemento de mídia). */
  showVideo?: boolean
  onVideoClick: (index: number) => void
  onVideoEnded: () => void
  previewMode?: boolean
  videoPreload?: 'none' | 'metadata'
}

/**
 * Otimiza URL do Cloudinary adicionando f_auto,q_auto,w_400
 * Ex: .../image/upload/v123/img.jpg → .../image/upload/f_auto,q_auto,w_400/v123/img.jpg
 */
function optimizePosterUrl(url: string): string {
  if (!url) return url
  const m = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/
  )
  if (!m) return url
  return `${m[1]}f_auto,q_auto,w_400/${m[2]}`
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

  // Ao (re)criar o vídeo: resetar estado visual
  useEffect(() => {
    if (showVideo) {
      setPosterVisible(true)
      setIsLoading(true)
    }
  }, [showVideo])

  const handleVideoPlay = () => {
    setPosterVisible(false)
    setIsLoading(false)
  }

  const handleVideoPause = () => {
    setPosterVisible(true)
    setIsLoading(true)
  }

  const handleVideoWaiting = () => setIsLoading(true)

  const handleVideoCanPlay = () => {
    if (!isLoading) return
    setIsLoading(false)
  }

  const handleVideoError = () => {
    setPosterVisible(true)
    setIsLoading(false)
  }

  const handleSlideClick = () => {
    if (!previewMode) onVideoClick(index)
  }

  const posterUrl = optimizePosterUrl(video.posterUrl)

  return (
    <div
      className="vcw-slide-inner"
      style={{ cursor: previewMode ? 'default' : 'pointer' }}
      onClick={handleSlideClick}
    >
      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#111' }}>

        {/* Área do vídeo — aspect ratio 9:16 */}
        <div style={{ position: 'relative', paddingTop: '177.78%' }}>

          {/* Poster overlay — visível enquanto pausado ou sem vídeo */}
          <img
            src={posterUrl}
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
              opacity: posterVisible || !showVideo ? 1 : 0,
              zIndex: 1,
              pointerEvents: 'none',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />

          {/* Shimmer — quando não há poster e vídeo está carregando */}
          {!video.posterUrl && isLoading && showVideo && (
            <div
              className="vcw-skeleton"
              style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            />
          )}

          {/* Vídeo — criado APENAS quando showVideo=true (1 elemento ativo por vez) */}
          {showVideo && (
            <video
              src={video.videoUrl}
              poster={posterUrl}
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
                zIndex: 4,
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

          {/* Ícone play — slide ativo após carregar */}
          {isActive && !isLoading && !previewMode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Card de produto */}
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
