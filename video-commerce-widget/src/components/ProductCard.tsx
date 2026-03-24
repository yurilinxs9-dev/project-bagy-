'use client'

import React from 'react'
import { VideoItem } from '@/types'

interface ProductCardProps {
  product: VideoItem['product']
  accentColor: string
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    } else {
      window.open(product.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 cursor-pointer"
      style={{
        padding: '6px 8px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="rounded object-cover flex-shrink-0"
        style={{ width: 40, height: 40, borderRadius: 6 }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-white truncate leading-tight"
          style={{ fontSize: '11.5px', marginBottom: 1 }}
        >
          {product.name}
        </p>
        <p
          className="text-white font-bold leading-tight"
          style={{ fontSize: '12.5px' }}
        >
          {product.price}
        </p>
      </div>
    </div>
  )
}
