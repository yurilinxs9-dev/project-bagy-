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

function pauseAllIn(el: HTMLElement | undefined | null) {
  if (!el) return
  el.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
    if (!v.paused) v.pause()
  })
}

function playActiveOnly(swiper: SwiperType) {
  pauseAllIn(swiper.el)
  const activeEl = swiper.slides?.[swiper.activeIndex]
  const vid = activeEl?.querySelector<HTMLVideoElement>('video')
  if (vid) {
    vid.currentTime = 0
    vid.play().catch(() => {})
  }
}

function calcSpv() {
  if (typeof window === 'undefined') return 5
  const slideW =
    window.innerWidth < 640 ? 130 : window.innerWidth < 1024 ? 160 : 190
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
  // Previne play/pause rápido quando o usuário rola perto do limiar de intersecção
  const isInViewRef = useRef(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [spv, setSpv] = useState(5)
  const [physicalActiveIdx, setPhysicalActiveIdx] = useState(videos.length)

  const N = videos.length
  const TOTAL = N * 3

  // Debounce de 200ms no resize — impede que a barra de URL do mobile
  // (que muda a altura do viewport ao rolar) dispare recálculos constantes
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>
    const calc = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => setSpv(Math.min(calcSpv(), 8)), 200)
    }
    setSpv(Math.min(calcSpv(), 8))
    window.addEventListener('resize', calc, { passive: true })
    return () => {
      window.removeEventListener('resize', calc)
      clearTimeout(debounceTimer)
    }
  }, [])

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const timer = setTimeout(() => {
      swiper.update()
      if (!previewMode && isInViewRef.current) playActiveOnly(swiper)
    }, 400)
    return () => clearTimeout(timer)
  }, [spv, previewMode])

  const handleEnter = useCallback(() => {
    // Cancela qualquer leave pendente (evita oscilação no limiar)
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    if (isInViewRef.current || previewMode) return
    isInViewRef.current = true
    setTimeout(() => {
      const swiper = swiperRef.current
      if (swiper && isInViewRef.current) playActiveOnly(swiper)
    }, 150)
  }, [previewMode])

  // Leave com debounce — impede que o IntersectionObserver oscilando perto
  // do footer cause pause/play rápido que gera "gap pra cima"
  const handleLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      isInViewRef.current = false
      pauseAllIn(swiperRef.current?.el)
    }, 300)
  }, [])

  useIntersection(containerRef, handleEnter, handleLeave)

  const tripled: VideoItem[] = [...videos, ...videos, ...videos]

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const idx = swiper.activeIndex
      setPhysicalActiveIdx(idx)
      onSlideChange(idx % N)
      // Pausa todos imediatamente; cada VideoSlide retoma via useEffect interno
      pauseAllIn(swiper.el)
    },
    [onSlideChange, N]
  )

  // Re-centralização sem flushSync — flushSync bloqueia o main thread durante
  // a animação Swiper causando frames dropados no mobile.
  // VideoSlide's useEffect cuida de iniciar o vídeo após re-render do React.
  const handleTransitionEnd = useCallback(
    (swiper: SwiperType) => {
      const idx = swiper.activeIndex
      if (idx < N || idx >= 2 * N) {
        const newIdx = idx < N ? idx + N : idx - N
        // Sem flushSync — React re-renderiza async, VideoSlide's useEffect executa play
        setPhysicalActiveIdx(newIdx)
        swiper.slideTo(newIdx, 0, false)
      }
    },
    [N]
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
        slidesPerView={spv}
        centeredSlides
        initialSlide={N}
        speed={500}
        spaceBetween={12}
        grabCursor={!previewMode}
        touchRatio={previewMode ? 0 : 1}
        allowTouchMove={!previewMode}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setPhysicalActiveIdx(swiper.activeIndex)
          setTimeout(() => {
            swiper.update()
            if (!previewMode) playActiveOnly(swiper)
          }, 500)
        }}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={handleTransitionEnd}
        style={{ overflow: 'visible', width: '100%' }}
        className="vcw-swiper"
      >
        {tripled.map((video, i) => {
          const logicalIdx = i % N
          const dist = Math.min(
            Math.abs(i - physicalActiveIdx),
            TOTAL - Math.abs(i - physicalActiveIdx)
          )
          const showVideo = dist <= 1

          return (
            <SwiperSlide key={`${video.id}-${i}`}>
              <VideoSlide
                video={video}
                settings={settings}
                isActive={logicalIdx === activeIndex}
                index={logicalIdx}
                showVideo={showVideo}
                onVideoClick={onVideoClick}
                onVideoEnded={handleVideoEnded}
                previewMode={previewMode}
                videoPreload={showVideo ? 'metadata' : 'none'}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>

      {settings.showArrows && !previewMode && (
        <>
          <button
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
