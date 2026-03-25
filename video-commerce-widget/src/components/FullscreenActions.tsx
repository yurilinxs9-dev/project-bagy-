'use client'

import React, { useState } from 'react'
import { VideoItem, WidgetSettings } from '@/types'
import { generateWhatsAppUrl } from '@/utils/whatsapp'

interface FullscreenActionsProps {
  video: VideoItem
  settings: WidgetSettings
  isLiked: boolean
  onToggleLike: () => void
}

function ActionBtn({
  label,
  onClick,
  ariaLabel,
  children,
}: {
  label: string
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 12,
        padding: '8px 6px 6px',
        cursor: 'pointer',
        width: 46,
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
    >
      {children}
      <span style={{ fontSize: 9, color: 'white', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)', lineHeight: 1 }}>
        {label}
      </span>
    </button>
  )
}

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={filled ? color : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export function FullscreenActions({ video, settings, isLiked, onToggleLike }: FullscreenActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleWhatsApp = () => {
    const phone = video.whatsapp || settings.whatsappDefault
    const url = generateWhatsAppUrl(phone, video.product.name, video.product.price, video.product.url)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: video.product.name, text: `Confira: ${video.product.name} por ${video.product.price}`, url: video.product.url })
      } catch { /* usuário cancelou */ }
    } else {
      await navigator.clipboard.writeText(video.product.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10,
      }}
    >
      {settings.showLike && (
        <ActionBtn label={isLiked ? 'Curtido' : 'Curtir'} onClick={onToggleLike} ariaLabel="Curtir">
          <HeartIcon filled={isLiked} color={settings.accentColor} />
        </ActionBtn>
      )}
      {settings.showWhatsapp && (
        <ActionBtn label="WhatsApp" onClick={handleWhatsApp} ariaLabel="WhatsApp">
          <WhatsAppIcon />
        </ActionBtn>
      )}
      {settings.showShare && (
        <ActionBtn label={copied ? 'Copiado!' : 'Compartilhar'} onClick={handleShare} ariaLabel="Compartilhar">
          <ShareIcon />
        </ActionBtn>
      )}
    </div>
  )
}
