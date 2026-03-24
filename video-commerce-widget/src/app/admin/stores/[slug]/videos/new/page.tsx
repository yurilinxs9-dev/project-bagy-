'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { VideoForm } from '@/components/admin/VideoForm'
import { VideoItem } from '@/types'

export default function StoreNewVideoPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data: VideoItem) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/videos?store=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Erro ao salvar')
      }
      router.push(`/admin/stores/${slug}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar vídeo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar vídeo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Preencha os dados do novo vídeo
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <VideoForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  )
}
