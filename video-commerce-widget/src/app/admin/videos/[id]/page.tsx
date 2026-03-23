'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoForm } from '@/components/admin/VideoForm'
import { VideoItem } from '@/types'

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [video, setVideo] = useState<VideoItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((videos: VideoItem[]) => {
        const found = videos.find((v) => v.id === params.id)
        if (!found) {
          setError('Vídeo não encontrado')
        } else {
          setVideo(found)
        }
      })
      .catch(() => setError('Erro ao carregar vídeo'))
      .finally(() => setFetching(false))
  }, [params.id])

  const handleSubmit = async (data: VideoItem) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/videos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Erro ao salvar')
      }
      router.push('/admin')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar vídeo')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-gray-500">Carregando...</div>
  }

  if (error && !video) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar vídeo</h1>
        <p className="text-gray-500 text-sm mt-1">ID: {params.id}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {video && (
        <VideoForm initialData={video} onSubmit={handleSubmit} isLoading={loading} />
      )}
    </div>
  )
}
