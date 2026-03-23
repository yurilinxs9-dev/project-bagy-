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

  // Loop só faz sentido com slides suficientes para preencher a view
  const useLoop = videos.length >= 5

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
      // Re-toca após mudança — garante clones do loop
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
      style={{ paddingTop: 8, paddingBottom: 8 }}
    >
      <Swiper
        // ── Slides per view numérico: Swiper calcula larguras internamente ──
        slidesPerView={1.8}
        breakpoints={{
          768:  { slidesPerView: 3,   spaceBetween: 12 },
          1024: { slidesPerView: 4.5, spaceBetween: 14 },
        }}
        centeredSlides
        loop={useLoop}
        loopAdditionalSlides={useLoop ? 2 : 0}
        initialSlide={Math.floor(videos.length / 2)}
        speed={500}
        spaceBetween={10}
        grabCursor={!previewMode}
        watchSlidesProgress
        touchRatio={previewMode ? 0 : 1}
        allowTouchMove={!previewMode}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          // update() força recalculo após render completo
          setTimeout(() => {
            swiper.update()
            if (!previewMode) playAllIn(swiper.el)
          }, 300)
          // segundo update garante layout correto após hidratação
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

      {/* Setas — fora do Swiper para não serem clipadas */}
      {settings.showArrows && !previewMode && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Anterior"
            className="absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
            style={{
              left: -14,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Próximo"
            className="absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
            style={{
              right: -14,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
