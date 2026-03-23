'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

import { VideoItem, WidgetSettings } from '@/types'
import { VideoSlide } from './VideoSlide'
import { useVideoControl } from '@/hooks/useVideoControl'
import { useIntersection } from '@/hooks/useIntersection'

interface VideoCarouselProps {
  videos: VideoItem[]
  settings: WidgetSettings
  activeIndex: number
  onSlideChange: (index: number) => void
  onVideoClick: (index: number) => void
  previewMode?: boolean
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
  const { setContainer, playAll, pauseAll } = useVideoControl()

  // Liga o container ref ao hook de controle de vídeo
  useEffect(() => {
    setContainer(containerRef.current)
  }, [setContainer])

  // IntersectionObserver: toca ao entrar na viewport, pausa ao sair
  const handleEnter = useCallback(() => {
    if (!previewMode) {
      // Pequeno delay para Swiper ter renderizado os slides
      setTimeout(playAll, 150)
    }
  }, [playAll, previewMode])

  const handleLeave = useCallback(() => {
    pauseAll()
  }, [pauseAll])

  useIntersection(containerRef, handleEnter, handleLeave)

  // Re-toca todos quando slide muda (garante clones em loop)
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      onSlideChange(swiper.realIndex)
      if (!previewMode) {
        setTimeout(playAll, 100)
      }
    },
    [onSlideChange, playAll, previewMode]
  )

  // Ao vídeo ativo terminar, avança para o próximo
  const handleVideoEnded = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev()
  }, [])

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative vcw-carousel"
      style={{ paddingTop: 8, paddingBottom: 8 }}
    >
      {/* Sem wrapper overflow:hidden — deixa os slides laterais aparecerem */}
      <Swiper
        slidesPerView="auto"
        centeredSlides
        loop
        loopAdditionalSlides={Math.max(videos.length, 4)}
        initialSlide={Math.floor(videos.length / 2)}
        speed={500}
        spaceBetween={10}
        grabCursor={!previewMode}
        watchSlidesProgress
        touchRatio={previewMode ? 0 : 1}
        threshold={5}
        resistance
        resistanceRatio={0.55}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          // Inicia playback assim que o Swiper estiver pronto
          if (!previewMode) {
            setTimeout(playAll, 200)
          }
        }}
        onSlideChange={handleSlideChange}
        style={{ overflow: 'visible' }}
        className="vcw-swiper"
      >
        {videos.map((video, index) => (
          <SwiperSlide
            key={video.id}
            style={{ width: 'var(--slide-width, 170px)', flexShrink: 0 }}
          >
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

      {/* Setas de navegação — só desktop, fora do Swiper para não ser clipado */}
      {settings.showArrows && !previewMode && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
            style={{
              left: -18,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
            style={{
              right: -18,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Próximo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
