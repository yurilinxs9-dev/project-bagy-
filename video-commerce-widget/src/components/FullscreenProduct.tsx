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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 15,
      }}
    >
      {/* Product info row — dark glass overlay */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: '10px 14px',
          background: 'radial-gradient(231% 135.8% at 0% 0%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.42) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{
              width: 55,
              height: 55,
              borderRadius: 8,
              objectFit: 'cover',
              flexShrink: 0,
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.88)',
              margin: '0 0 3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {product.price}
          </p>
        </div>
      </div>

      {/* CTA button — solid black, full width */}
      <button
        onClick={handleAddToCart}
        style={{
          width: '100%',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: 0,
          fontWeight: 400,
          fontSize: 14,
          padding: '13px 0',
          cursor: 'pointer',
          letterSpacing: 0.3,
          display: 'block',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#000' }}
      >
        Adicionar produto
      </button>
    </div>
  )
})
