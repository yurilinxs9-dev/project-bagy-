'use client'

import React from 'react'
import { VideoItem } from '@/types'

interface FullscreenProductProps {
  product: VideoItem['product']
  accentColor: string
}

export const FullscreenProduct = React.memo(function FullscreenProduct({ product }: FullscreenProductProps) {
  const handleAddToCart = () => {
    window.location.href = product.url
  }

  return (
    <div
      style={{
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        padding: '12px 16px 16px',
        flexShrink: 0,
      }}
    >
      {/* Row: image + name + price */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{
              width: 64,
              height: 64,
              borderRadius: 10,
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.07)',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#111',
              margin: '0 0 4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.35,
            }}
          >
            {product.name}
          </p>
          <p
            style={{
              fontSize: 17,
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

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        style={{
          width: '100%',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          padding: '12px 0',
          cursor: 'pointer',
          letterSpacing: 0.2,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
      >
        Adicionar produto
      </button>
    </div>
  )
})
