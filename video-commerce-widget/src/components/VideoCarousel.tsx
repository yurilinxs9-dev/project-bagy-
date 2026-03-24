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

function calcSpv() {
  if (typeof window === 'undefined') return 5
  const slideW = window.innerWidth < 768 ? 170 : window.innerWidth < 1024 ? 210 : 245
  return window.innerWidth / (slideW + 12)
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

  const [spv, setSpv] = useState(5)

  useEffect(() => {
    // Cap em N-0.5 para nunca mostrar ≥N slides ao mesmo tempo (evita duplicatas entre grupos)
    const calc = () => setSpv(Math.min(calcSpv(), videos.length - 0.5))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [videos.length])

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const timer = setTimeout(() => {
      swiper.update()
      if (!previewMode) playAllIn(swiper.el)
    }, 400)
    return () => clearTimeout(timer)
  }, [spv, previewMode])

  const handleEnter = useCallback(() => {
    if (!previewMode) setTimeout(() => playAllIn(swiperRef.current?.el), 150)
  }, [previewMode])

  const handleLeave = useCallback(() => pauseAllIn(swiperRef.current?.el), [])

  useIntersection(containerRef, handleEnter, handleLeave)

  /*
   * Swiper 11: loop é desativado se slides.length < ceil(spv)*2+1.
   * Com 7 vídeos e spv≈2.4, o mínimo é 7 — borderline que o Swiper rejeita.
   * Solução: triplicar o array → 21 slides. Loop funciona com folga.
   * initialSlide = videos.length (7) coloca o início do grupo do meio no centro.
   * onSlideChange mapeia realIndex de volta para 0..N-1 via módulo.
   */
  const tripled: VideoItem[] = [...videos, ...videos, ...videos]

  const N = videos.length
  const prevIdx = (activeIndex - 1 + N) % N
  const nextIdx = (activeIndex + 1) % N

  function getPreload(logicalIdx: number): 'metadata' | 'none' {
    return logicalIdx === activeIndex || logicalIdx === prevIdx || logicalIdx === nextIdx
      ? 'metadata'
      : 'none'
  }

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      onSlideChange(swiper.realIndex % videos.length)
      if (!previewMode) setTimeout(() => playAllIn(swiper.el), 120)
    },
    [onSlideChange, previewMode, videos.length]
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
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        overflow: 'hidden',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <Swiper
        slidesPerView={spv}
        centeredSlides
        loop
        initialSlide={videos.length}          // inicia no começo do grupo do meio
        speed={500}
        spaceBetween={12}
        grabCursor={!previewMode}
        watchSlidesProgress
        touchRatio={previewMode ? 0 : 1}
        allowTouchMove={!previewMode}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setTimeout(() => {
            swiper.update()
            if (!previewMode) playAllIn(swiper.el)
          }, 500)
        }}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={(swiper) => {
          if (!previewMode) playAllIn(swiper.el)
        }}
        style={{ overflow: 'visible', width: '100%' }}
        className="vcw-swiper"
      >
        {tripled.map((video, i) => {
          const logicalIdx = i % N
          return (
            <SwiperSlide key={`${video.id}-${i}`}>
              <VideoSlide
                video={video}
                settings={settings}
                isActive={logicalIdx === activeIndex}
                index={logicalIdx}
                onVideoClick={onVideoClick}
                onVideoEnded={handleVideoEnded}
                previewMode={previewMode}
                videoPreload={getPreload(logicalIdx)}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>

      {settings.showArrows && !previewMode && (
        <>
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Anterior"
            style={{
              position: 'absolute', top: '50%', left: 16,
              transform: 'translateY(-50%)', zIndex: 20,
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
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
              position: 'absolute', top: '50%', right: 16,
              transform: 'translateY(-50%)', zIndex: 20,
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
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
