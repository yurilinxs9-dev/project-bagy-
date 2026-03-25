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

/** Pausa todos os vídeos no container */
function pauseAllIn(el: HTMLElement | undefined | null) {
  if (!el) return
  el.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
    if (!v.paused) v.pause()
  })
}

/** Pausa todos e toca APENAS o slide fisicamente ativo */
function playActiveOnly(swiper: SwiperType) {
  pauseAllIn(swiper.el)
  const activeEl = swiper.slides?.[swiper.activeIndex]
  activeEl?.querySelector<HTMLVideoElement>('video')?.play().catch(() => {})
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

  const [spv, setSpv] = useState(5)
  // Índice físico do slide ativo no array triplicado (0..3N-1)
  const [physicalActiveIdx, setPhysicalActiveIdx] = useState(videos.length)

  const N = videos.length
  const TOTAL = N * 3

  useEffect(() => {
    const calc = () => setSpv(Math.min(calcSpv(), 8))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const timer = setTimeout(() => {
      swiper.update()
      if (!previewMode) playActiveOnly(swiper)
    }, 400)
    return () => clearTimeout(timer)
  }, [spv, previewMode])

  const handleEnter = useCallback(() => {
    if (!previewMode) {
      setTimeout(() => {
        const swiper = swiperRef.current
        if (swiper) playActiveOnly(swiper)
      }, 150)
    }
  }, [previewMode])

  const handleLeave = useCallback(
    () => pauseAllIn(swiperRef.current?.el),
    []
  )

  useIntersection(containerRef, handleEnter, handleLeave)

  const tripled: VideoItem[] = [...videos, ...videos, ...videos]

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const idx = swiper.activeIndex
      setPhysicalActiveIdx(idx)
      onSlideChange(idx % N)
      if (!previewMode) {
        setTimeout(() => playActiveOnly(swiper), 120)
      }
    },
    [onSlideChange, previewMode, N]
  )

  // Após a transição: toca vídeo ativo e re-centraliza silenciosamente quando
  // o usuário entrou na 1ª ou 3ª cópia (para loop infinito sem Swiper loop mode)
  const handleTransitionEnd = useCallback(
    (swiper: SwiperType) => {
      if (!previewMode) playActiveOnly(swiper)
      const idx = swiper.activeIndex
      if (idx < N) {
        const newIdx = idx + N
        swiper.slideTo(newIdx, 0, false)
        setPhysicalActiveIdx(newIdx)
      } else if (idx >= 2 * N) {
        const newIdx = idx - N
        swiper.slideTo(newIdx, 0, false)
        setPhysicalActiveIdx(newIdx)
      }
    },
    [previewMode, N]
  )

  const handleVideoEnded = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  return (
    // Usa width:100% em vez de 100vw para evitar overflow da scrollbar
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
      {/* SEM loop={true} — Swiper loop insere clones que deslocam activeIndex,
          corrompendo physicalActiveIdx. Re-centralização manual no transitionEnd. */}
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
          // Distância circular no array triplicado até o slide ativo
          const dist = Math.min(
            Math.abs(i - physicalActiveIdx),
            TOTAL - Math.abs(i - physicalActiveIdx)
          )
          // Apenas active±1 têm elemento <video> no DOM (economia de memória)
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
