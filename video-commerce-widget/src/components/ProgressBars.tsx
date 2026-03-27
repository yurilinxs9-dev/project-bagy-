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
    <>
      {/* Gradient shadow for readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />
      <div
        style={{
          display: 'flex',
          gap: 3,
          padding: '12px 10px 6px',
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
                height: 3,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.32)',
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
    </>
  )
}
