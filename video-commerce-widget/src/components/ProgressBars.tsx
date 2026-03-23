'use client'

import React from 'react'

interface ProgressBarsProps {
  total: number
  current: number
  videoDuration: number
  isPlaying: boolean
}

export function ProgressBars({
  total,
  current,
  videoDuration,
  isPlaying,
}: ProgressBarsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 3,
        padding: '8px 10px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isPast = i < current
        const isCurrent = i === current

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2.5,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
            }}
          >
            {isPast && (
              <div style={{ width: '100%', height: '100%', background: 'white' }} />
            )}
            {isCurrent && (
              <div
                key={`progress-${current}`}
                style={{
                  height: '100%',
                  background: 'white',
                  animation: `vcw-progress ${videoDuration}s linear forwards`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                  width: '0%',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
