'use client'

import React, { useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

import { VideoItem, WidgetSettings } from '@/types'
import { VideoSlide } from './VideoSlide'
import { useIntersection } from '@/hooks/useIntersection'

interface VideoCarouselProps {
  videos: VideoItem[]
  settings: WidgetSettings
  activeIndex: number
  onSlideChange: (index: number) => void
  onVideoClick: (index: number) => void
  previewMode?: boolean
}

/** Toca todos os vídeos visíveis no elemento Swiper (original + clones de loop) */
function playAllIn(el: HTMLElement | undefined | null) {
  if (!el) return
  el.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
    if (v.paused) v.play().catch(() => {})
  })
}

function pauseAllIn(el: HTMLElement | undefined | null) {
  if (!el) return
  el.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
    if (!v.paused) v.pause()
  })
}

export function VideoCarousel({
  videos,
  settings,
  activeIndex,
  onSlideChange,
  onVideoClick,
  previewMode = false,
}: VideoCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  // IntersectionObserver no container: play ao entrar, pause ao sair da viewport
  const handleEnter = useCallback(() => {
    if (!previewMode) {
      setTimeout(() => playAllIn(swiperRef.current?.el), 150)
    }
  }, [previewMode])

  const handleLeave = useCallback(() => {
    pauseAllIn(swiperRef.current?.el)
  }, [])

  useIntersection(containerRef, handleEnter, handleLeave)

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      onSlideChange(swiper.realIndex)
      if (!previewMode) {
        setTimeout(() => playAllIn(swiper.el), 120)
      }
    },
    [onSlideChange, previewMode]
  )

  const handleVideoEnded = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  const handlePrev = () => swiperRef.current?.slidePrev()
  const handleNext = () => swiperRef.current?.slideNext()

  return (
    <div
      ref={containerRef}
      className="relative vcw-carousel"
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Swiper
        slidesPerView={2.2}
        breakpoints={{
          768:  { slidesPerView: 3.5, spaceBetween: 12 },
          1024: { slidesPerView: 5.5, spaceBetween: 14 },
        }}
        centeredSlides
        loop
        loopAdditionalSlides={Math.max(videos.length, 6)}
        initialSlide={Math.floor(videos.length / 2)}
        speed={500}
        spaceBetween={10}
        grabCursor={!previewMode}
        watchSlidesProgress
        touchRatio={previewMode ? 0 : 1}
        allowTouchMove={!previewMode}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setTimeout(() => {
            swiper.update()
            if (!previewMode) playAllIn(swiper.el)
          }, 300)
          setTimeout(() => swiper.update(), 500)
        }}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={(swiper) => {
          if (!previewMode) playAllIn(swiper.el)
        }}
        style={{ overflow: 'visible' }}
        className="vcw-swiper"
      >
        {videos.map((video, index) => (
          <SwiperSlide key={video.id}>
            <VideoSlide
              video={video}
              settings={settings}
              isActive={index === activeIndex}
              index={index}
              onVideoClick={onVideoClick}
              onVideoEnded={handleVideoEnded}
              previewMode={previewMode}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Setas sobrepostas aos slides laterais, como LV Store */}
      {settings.showArrows && !previewMode && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Anterior"
            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              left: 20,
              zIndex: 20,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Próximo"
            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              right: 20,
              zIndex: 20,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
