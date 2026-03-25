'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { WidgetConfig } from '@/types'
import { VideoCarousel } from './VideoCarousel'
import { FullscreenPlayer } from './FullscreenPlayer'
import { CarouselSkeleton } from './CarouselSkeleton'
import videosJson from '@/data/videos.json'

interface VideoShowcaseProps {
  config?: WidgetConfig
  storeSlug?: string
}

export function VideoShowcase({ config: configProp, storeSlug }: VideoShowcaseProps) {
  const [config, setConfig] = useState<WidgetConfig | null>(configProp ?? null)
  const [loading, setLoading] = useState(!configProp)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (configProp) return
    const apiUrl =
      typeof window !== 'undefined'
        ? (
            window as typeof window & {
              __VIDEO_WIDGET_API_URL__?: string
            }
          ).__VIDEO_WIDGET_API_URL__ ?? ''
        : ''

    const slug =
      storeSlug ??
      (typeof window !== 'undefined'
        ? (window as typeof window & { __VIDEO_WIDGET_STORE__?: string })
            .__VIDEO_WIDGET_STORE__
        : undefined)

    const storeParam = slug ? `?store=${encodeURIComponent(slug)}` : ''

    Promise.all([
      fetch(`${apiUrl}/api/videos${storeParam}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`${apiUrl}/api/settings${storeParam}`, { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([videos, settings]) => {
        setConfig({ videos, settings })
      })
      .catch(() => {
        setConfig(videosJson as WidgetConfig)
      })
      .finally(() => setLoading(false))
  }, [configProp, storeSlug])

  const handleSlideChange = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const handleVideoClick = useCallback((index: number) => {
    setFullscreenIndex(index)
    setIsFullscreen(true)
  }, [])

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  const handleToggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  if (loading) return <CarouselSkeleton />
  if (!config) return null

  return (
    <>
      <VideoCarousel
        videos={config.videos}
        settings={config.settings}
        activeIndex={activeIndex}
        onSlideChange={handleSlideChange}
        onVideoClick={handleVideoClick}
      />

      {isFullscreen && (
        <FullscreenPlayer
          videos={config.videos}
          settings={config.settings}
          initialIndex={fullscreenIndex}
          likedIds={likedIds}
          onToggleLike={handleToggleLike}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  )
}
