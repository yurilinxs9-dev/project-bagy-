'use client'

import React from 'react'
import { WidgetConfig } from '@/types'
import { VideoCarousel } from '@/components/VideoCarousel'

interface WidgetPreviewProps {
  config: WidgetConfig
  onRefresh: () => void
}

export function WidgetPreview({ config, onRefresh }: WidgetPreviewProps) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Preview do Widget</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Ao vivo
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <VideoCarousel
          videos={config.videos}
          settings={config.settings}
          activeIndex={1}
          onSlideChange={() => {}}
          onVideoClick={() => {}}
          previewMode
        />
      </div>
    </section>
  )
}
