'use client'

import React, { useState } from 'react'
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
  videoPreload?: 'none' | 'metadata'
}

export function VideoSlide({
  video,
  settings,
  isActive,
  index,
  onVideoClick,
  onVideoEnded,
  previewMode = false,
  videoPreload = 'none',
}: VideoSlideProps) {
  const [posterVisible, setPosterVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const handleVideoPlay = () => {
    setPosterVisible(false)
    setIsLoading(false)
  }

  // Ao pausar: volta a mostrar o poster (slide ficou inativo)
  const handleVideoPause = () => {
    setPosterVisible(true)
    setIsLoading(true)
  }

  const handleVideoWaiting = () => {
    setIsLoading(true)
  }

  const handleVideoCanPlay = () => {
    if (!isLoading) return // já carregado
    setIsLoading(false)
  }

  const handleVideoError = () => {
    setPosterVisible(true)
    setIsLoading(false)
  }

  // Clique em qualquer parte do slide abre o fullscreen
  const handleSlideClick = () => {
    if (!previewMode) onVideoClick(index)
  }

  return (
    <div
      className="vcw-slide-inner"
      style={{ cursor: previewMode ? 'default' : 'pointer' }}
      onClick={handleSlideClick}
    >
      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#111' }}>

        {/* Área do vídeo — aspect ratio 9:16 */}
        <div style={{ position: 'relative', paddingTop: '177.78%' }}>

          {/* Poster overlay — visível enquanto pausado ou carregando */}
          <img
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

          {/* Shimmer — quando não há poster */}
          {!video.posterUrl && isLoading && (
            <div
              className="vcw-skeleton"
              style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            />
          )}

          {/* Vídeo — sem controles nativos, clique gerenciado pelo div pai */}
          <video
            src={video.videoUrl}
            poster={video.posterUrl}
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
              pointerEvents: 'none', // clique gerenciado pelo div pai
            }}
          />

          {/* Spinner — slide ativo enquanto carrega */}
          {isActive && isLoading && !previewMode && (
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
