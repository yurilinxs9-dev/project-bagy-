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

function generatePosterFromVideoUrl(videoUrl: string): string {
  if (!videoUrl) return ''
  const m = videoUrl.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*)\.[^.]+$/)
  if (!m) return ''
  return `${m[1]}so_0.5,f_jpg,q_auto,w_300/${m[2]}.jpg`
}

function optimizeVideoUrl(url: string): string {
  if (!url) return url
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*?)(\.[^.]+)$/)
  if (!m) return url
  if (m[3].toLowerCase() === '.mp4') return url
  return `${m[1]}f_mp4,vc_h264,q_auto/${m[2]}.mp4`
}

function SidePanel({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  const poster = video.posterUrl || generatePosterFromVideoUrl(video.videoUrl)
  return (
    <div
      onClick={onClick}
      style={{
        width: 110,
        flexShrink: 0,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: 0.45,
        aspectRatio: '9/16',
        position: 'relative',
        background: '#111',
        transition: 'opacity 200ms ease',
        alignSelf: 'center',
        maxHeight: '65dvh',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.65' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.45' }}
    >
      {poster ? (
        <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #2a2a2a, #111)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />
    </div>
  )
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
  const [isDesktop, setIsDesktop] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const total = videos.length

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const goNext = useCallback(() => setCurrentIndex((i) => (i + 1) % total), [total])
  const goPrev = useCallback(() => setCurrentIndex((i) => (i - 1 + total) % total), [total])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.src = optimizeVideoUrl(videos[currentIndex].videoUrl)
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
  const prevVideo = videos[(currentIndex - 1 + total) % total]
  const nextVideo = videos[(currentIndex + 1) % total]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isDesktop ? 20 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Left thumbnail panel — desktop only */}
      {isDesktop && total > 1 && (
        <SidePanel video={prevVideo} onClick={goPrev} />
      )}

      {/* Center panel */}
      <div
        style={{
          position: 'relative',
          width: isDesktop ? 'auto' : '100%',
          height: isDesktop ? '88dvh' : '100dvh',
          aspectRatio: isDesktop ? '9/16' : 'auto',
          maxWidth: isDesktop ? 420 : '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isDesktop ? 20 : 0,
          overflow: 'hidden',
          background: '#000',
          boxShadow: isDesktop ? '0 24px 80px rgba(0,0,0,0.7)' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Full video area */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, background: '#000', overflow: 'hidden' }}>

          {/* Progress bars */}
          <ProgressBars
            total={total}
            current={currentIndex}
            videoDuration={videoDuration}
            isPlaying={isPlaying}
          />

          {/* Main video */}
          <video
            ref={videoRef}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={goNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Gradient overlay for product card readability */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Tap zone: prev (left 28%) */}
          <div
            style={{ position: 'absolute', left: 0, top: 56, width: '28%', bottom: 0, zIndex: 8, cursor: 'pointer' }}
            onClick={goPrev}
          />
          {/* Tap zone: next (right 28%) */}
          <div
            style={{ position: 'absolute', right: 0, top: 56, width: '28%', bottom: 0, zIndex: 8, cursor: 'pointer' }}
            onClick={goNext}
          />

          {/* Unmute button */}
          {isMuted && (
            <button
              onClick={handleUnmute}
              aria-label="Ativar som"
              style={{
                position: 'absolute', top: 48, left: 14, zIndex: 20,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
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

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: 44, right: 14, zIndex: 20,
              width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(97.57% 210.75% at 0.9% 2.98%, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.16) 100%)',
              backdropFilter: 'blur(21px)',
              WebkitBackdropFilter: 'blur(21px)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Action buttons (right side) */}
          <FullscreenActions
            video={video}
            settings={settings}
            isLiked={likedIds.has(video.id)}
            onToggleLike={() => onToggleLike(video.id)}
          />

          {/* Product card — overlaid at bottom of video */}
          <FullscreenProduct
            product={video.product}
            accentColor={settings.accentColor}
          />
        </div>
      </div>

      {/* Right thumbnail panel — desktop only */}
      {isDesktop && total > 1 && (
        <SidePanel video={nextVideo} onClick={goNext} />
      )}
    </div>
  )
}
