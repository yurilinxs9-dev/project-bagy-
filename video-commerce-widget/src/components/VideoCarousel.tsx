'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
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

function getSlideWidth(vw: number) {
  if (vw < 768) return 170
  if (vw < 1024) return 210
  return 245
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

  // slideWidth calculado no cliente para evitar hydration mismatch
  const [slideWidth, setSlideWidth] = useState(245)

  useEffect(() => {
    const update = () => setSlideWidth(getSlideWidth(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Após montar: recalcula e toca vídeos
  useEffect(() => {
    const timer = setTimeout(() => {
      const swiper = swiperRef.current
      if (!swiper) return
      swiper.update()
      if (!previewMode) playAllIn(swiper.el)
      // Diagnóstico
      console.log('VCW Carousel:', {
        containerWidth: containerRef.current?.offsetWidth,
        viewportWidth: window.innerWidth,
        slideWidth,
        slidesPerView: swiper.params.slidesPerView,
        totalSlides: swiper.slides.length,
        activeIndex: swiper.activeIndex,
        realIndex: swiper.realIndex,
        loopAdditionalSlides: swiper.params.loopAdditionalSlides,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [videos.length, previewMode, slideWidth])

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
        // Técnica full-bleed: escapa de qualquer container pai com padding/max-width
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        overflow: 'hidden',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <Swiper
        // slidesPerView:'auto' + width fixa no slide = layout previsível sem espaço vazio
        slidesPerView="auto"
        centeredSlides
        loop
        loopAdditionalSlides={videos.length * 3}
        initialSlide={Math.floor(videos.length / 2)}
        speed={500}
        spaceBetween={12}
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
          <SwiperSlide key={video.id} style={{ width: slideWidth }}>
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

      {/* Setas sobre slides laterais */}
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
