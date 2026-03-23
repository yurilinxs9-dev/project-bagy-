'use client'

import React from 'react'

export function CarouselSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '20px 0',
        overflow: 'hidden',
        justifyContent: 'center',
      }}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="vcw-skeleton flex-shrink-0"
          style={{
            width: i === 2 ? 'var(--slide-width)' : 'calc(var(--slide-width) * 0.92)',
            height: 'calc(var(--slide-width) * 1.52 + 56px)',
            borderRadius: 14,
            opacity: i === 2 ? 1 : 0.72,
            transform: i === 2 ? 'scale(1)' : 'scale(0.92)',
          }}
        />
      ))}
    </div>
  )
}
