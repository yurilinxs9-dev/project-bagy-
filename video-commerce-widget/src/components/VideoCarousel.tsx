'use client'

import React, { useRef, useCallback, useEffect } from 'react'
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
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  // Após montar: força recalculo e posiciona no slide central
  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const target = Math.floor(videos.length / 2)
    const timer = setTimeout(() => {
      swiper.update()
      swiper.slideToLoop(target, 0) // sem animação — posiciona direto no centro
      if (!previewMode) playAllIn(swiper.el)
      // Debug
      console.log('Swiper config:', {
        slidesPerView: swiper.params.slidesPerView,
        loop: swiper.params.loop,
        loopAdditionalSlides: swiper.params.loopAdditionalSlides,
        totalSlides: swiper.slides.length,
        activeIndex: swiper.activeIndex,
        realIndex: swiper.realIndex,
        videosLength: videos.length,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [videos.length, previewMode])

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

  return (
    <div
      ref={containerRef}
      className="vcw-carousel"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <Swiper
        centeredSlides
        loop
        loopAdditionalSlides={videos.length}
        initialSlide={0}
        speed={500}
        spaceBetween={12}
        slidesPerView={2.3}
        breakpoints={{
          768:  { slidesPerView: 3.5, spaceBetween: 14 },
          1024: { slidesPerView: 5.5, spaceBetween: 16 },
          1440: { slidesPerView: 6.5, spaceBetween: 16 },
        }}
        grabCursor={!previewMode}
        watchSlidesProgress
        touchRatio={previewMode ? 0 : 1}
        allowTouchMove={!previewMode}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={(swiper) => {
          if (!previewMode) playAllIn(swiper.el)
        }}
        style={{ overflow: 'visible', width: '100%' }}
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

      {/* Setas sobrepostas sobre os slides laterais */}
      {settings.showArrows && !previewMode && (
        <>
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Anterior"
            style={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Próximo"
            style={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
