'use client'

import React from 'react'
import { VideoItem } from '@/types'

interface ProductCardProps {
  product: VideoItem['product']
  accentColor: string
  onClick?: () => void
}

export const ProductCard = React.memo(function ProductCard({ product, onClick }: ProductCardProps) {
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: '#ffffff',
        borderTop: '1px solid #d8d8d8',
        cursor: 'pointer',
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f8f8')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            objectFit: 'cover',
            flexShrink: 0,
          }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: '#111',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#111',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {product.price}
        </p>
      </div>
    </div>
  )
})
