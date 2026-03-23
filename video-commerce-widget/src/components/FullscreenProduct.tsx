'use client'

import React from 'react'
import { VideoItem } from '@/types'

interface FullscreenProductProps {
  product: VideoItem['product']
  accentColor: string
}

export function FullscreenProduct({ product, accentColor }: FullscreenProductProps) {
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
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.78))',
          padding: '48px 12px 12px',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 9,
            padding: 10,
            backdropFilter: 'blur(4px)',
            marginBottom: 80,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
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
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {product.name}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'white',
                  margin: 0,
                }}
              >
                {product.price}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              background: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              padding: '10px 0',
              cursor: 'pointer',
              color: '#111',
            }}
          >
            Adicionar produto
          </button>
        </div>
      </div>
    </div>
  )
}
