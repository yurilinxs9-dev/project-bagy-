'use client'

import React, { useRef, useState } from 'react'
import { VideoItem, WidgetSettings } from '@/types'
import { ProductCard } from './ProductCard'

interface VideoSlideProps {
  video: VideoItem
  settings: WidgetSettings
  isActive: boolean
  index: number
  onVideoClick: (index: number) => void
  onVideoEnded: () => void
  previewMode?: boolean
}

export function VideoSlide({
  video,
  settings,
  isActive,
  index,
  onVideoClick,
  onVideoEnded,
  previewMode = false,
}: VideoSlideProps) {
  const posterRef = useRef<HTMLImageElement>(null)
  const [posterVisible, setPosterVisible] = useState(true)

  const handleVideoPlay = () => {
    setPosterVisible(false)
  }

  const handleVideoPause = () => {
    // Mantém poster oculto enquanto ainda há conteúdo carregado
  }

  const handleVideoError = () => {
    // Mostra o poster se o vídeo falhar
    setPosterVisible(true)
  }

  const handleClick = () => {
    if (!previewMode) onVideoClick(index)
  }

  return (
    // vcw-slide-inner: recebe transform/opacity/shadow do CSS (.swiper-slide-active)
    <div className="vcw-slide-inner" style={{ cursor: previewMode ? 'default' : 'pointer' }}>
      {/* Conteúdo com overflow hidden para o border-radius funcionar */}
      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#111' }}>

        {/* Área do vídeo — aspect ratio 9:16 */}
        <div style={{ position: 'relative', paddingTop: '177.78%' }}>

          {/* Poster overlay — visível até o vídeo tocar */}
          <img
            ref={posterRef}
            src={video.posterUrl}
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
              opacity: posterVisible ? 1 : 0,
              zIndex: 1,
              pointerEvents: 'none',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />

          {/* Vídeo — src direto com preload none */}
          <video
            src={video.videoUrl}
            poster={video.posterUrl}
            muted
            playsInline
            preload="none"
            loop
            onClick={handleClick}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
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
            }}
          />

          {/* Ícone play apenas no slide ativo e não em preview */}
          {isActive && !previewMode && (
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
