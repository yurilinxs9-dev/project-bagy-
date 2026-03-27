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

function optimizePosterUrl(url: string): string {
  if (!url) return ''
  const m = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/
  )
  if (!m) return url
  return `${m[1]}f_auto,q_auto,w_400/${m[2]}`
}

function generatePosterFromVideoUrl(videoUrl: string): string {
  if (!videoUrl) return ''
  const m = videoUrl.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*)\.[^.]+$/
  )
  if (!m) return ''
  return `${m[1]}so_0.5,f_jpg,q_auto,w_400/${m[2]}.jpg`
}

// Converte .mov/.avi/.webm para mp4 h264 via Cloudinary — compatível com todos os browsers
function optimizeVideoUrl(url: string): string {
  if (!url) return url
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*?)(\.[^.]+)$/)
  if (!m) return url
  const ext = m[3].toLowerCase()
  if (ext === '.mp4') return url
  return `${m[1]}f_mp4,vc_h264,q_auto/${m[2]}.mp4`
}

export const VideoSlide = React.memo(function VideoSlide({
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [posterVisible, setPosterVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  // canplay já disparou neste ciclo: permite que onPlay esconda poster em retomadas
  const isReadyRef = useRef(false)
  // ref para usar o valor atualizado de isActive dentro de handlers de evento
  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  // Reset ao montar/desmontar o vídeo
  useEffect(() => {
    if (showVideo) {
      setPosterVisible(true)
      setIsLoading(true)
      isReadyRef.current = false
    }
  }, [showVideo])

  // Auto-play/pause via React effect — cobre o caso de re-centralização do loop
  // onde o carousel não tem mais flushSync e o play precisa acontecer após o render
  useEffect(() => {
    const vid = videoRef.current
    if (!vid || previewMode) return
    if (isActive && showVideo) {
      vid.currentTime = 0
      vid.play().catch(() => {
        // Falhou (vídeo ainda carregando) — handleVideoCanPlay irá retomar
      })
    } else if (showVideo && !vid.paused) {
      // Slide adjacente carregado mas não ativo — garante que está pausado
      vid.pause()
    }
  }, [isActive, showVideo, previewMode])

  // canplay: primeiro frame disponível
  const handleVideoCanPlay = () => {
    isReadyRef.current = true
    setIsLoading(false)
    setPosterVisible(false)
    // Retenta play caso o useEffect rodou antes do vídeo estar pronto
    if (isActiveRef.current && !previewMode) {
      videoRef.current?.play().catch(() => {})
    }
  }

  // onPlay em retomadas (canplay não re-dispara): esconde poster se já pronto
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

  const optimizedVideoUrl = optimizeVideoUrl(video.videoUrl)
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
      <div style={{ borderRadius: 15, overflow: 'hidden', background: '#1a1a1a', position: 'relative' }}>

        <div style={{ position: 'relative', paddingTop: '177.78%' }}>

          {/* Camada 1 — gradiente de fundo (fallback sempre presente) */}
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

          {/* Camada 2 — poster manual ou thumbnail gerado pelo Cloudinary */}
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
              ref={videoRef}
              src={optimizedVideoUrl}
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

        {/* Product chip — sobreposto no fundo do card 9:16 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6 }}>
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
    </div>
  )
})
