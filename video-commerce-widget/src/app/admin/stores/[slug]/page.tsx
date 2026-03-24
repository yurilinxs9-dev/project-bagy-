'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VideoItem, WidgetConfig } from '@/types'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { WidgetPreview } from '@/components/admin/WidgetPreview'

function SortableVideoCard({
  video,
  index,
  slug,
  onRemove,
}: {
  video: VideoItem
  index: number
  slug: string
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing text-xl flex-shrink-0 select-none"
        aria-label="Arrastar"
      >
        ⠿
      </button>
      <span className="text-2xl font-bold text-gray-200 w-6 flex-shrink-0 select-none">
        {index + 1}
      </span>
      <img
        src={video.posterUrl}
        alt={video.product.name}
        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{video.product.name}</p>
        <p className="text-sm text-gray-500">{video.product.price}</p>
        <p className="text-xs text-gray-400 truncate">{video.videoUrl}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Link
          href={`/admin/stores/${slug}/videos/${video.id}`}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Editar
        </Link>
        <button
          onClick={() => onRemove(video.id)}
          className="text-sm px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          Remover
        </button>
      </div>
    </div>
  )
}

export default function StoreVideosPage() {
  const { slug } = useParams<{ slug: string }>()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [settings, setSettings] = useState<WidgetConfig['settings'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, settingsRes] = await Promise.all([
        fetch(`/api/videos?store=${slug}`),
        fetch(`/api/settings?store=${slug}`),
      ])
      setVideos(await videosRes.json())
      setSettings(await settingsRes.json())
    } catch {
      showToast('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRemove = async (id: string) => {
    setConfirmId(null)
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setVideos((v) => v.filter((x) => x.id !== id))
      showToast('Vídeo removido!')
    } catch {
      showToast('Erro ao remover vídeo')
    }
  }

  const persistReorder = useCallback(
    async (reordered: VideoItem[]) => {
      setSaving(true)
      try {
        await fetch('/api/videos/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reordered),
        })
        showToast('Ordem atualizada!')
      } catch {
        showToast('Erro ao salvar ordem')
      } finally {
        setSaving(false)
      }
    },
    []
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setVideos((prev) => {
      const oldIdx = prev.findIndex((v) => v.id === active.id)
      const newIdx = prev.findIndex((v) => v.id === over.id)
      const reordered = arrayMove(prev, oldIdx, newIdx)
      persistReorder(reordered)
      return reordered
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Carregando...
      </div>
    )
  }

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        message="Tem certeza que deseja remover este vídeo? Esta ação não pode ser desfeita."
        onConfirm={() => confirmId && handleRemove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vídeos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {videos.length}{' '}
            {videos.length === 1 ? 'vídeo cadastrado' : 'vídeos cadastrados'}
            {saving && (
              <span className="ml-2 text-blue-500">Salvando...</span>
            )}
          </p>
        </div>
        <Link
          href={`/admin/stores/${slug}/videos/new`}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Adicionar vídeo
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-900 font-semibold mb-2">Nenhum vídeo cadastrado</p>
          <p className="text-gray-500 text-sm mb-6">
            Adicione o primeiro vídeo para começar
          </p>
          <Link
            href={`/admin/stores/${slug}/videos/new`}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Adicionar vídeo
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={videos.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {videos.map((video, i) => (
                <SortableVideoCard
                  key={video.id}
                  video={video}
                  index={i}
                  slug={slug}
                  onRemove={(id) => setConfirmId(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {settings && videos.length > 0 && (
        <WidgetPreview config={{ videos, settings }} onRefresh={fetchData} />
      )}
    </>
  )
}
