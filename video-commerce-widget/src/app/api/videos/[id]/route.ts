import { getVideos, setVideos } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { VideoItem } from '@/types'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let updates: Partial<VideoItem>
  try {
    updates = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const videos = await getVideos()
  const idx = videos.findIndex((v) => v.id === params.id)

  if (idx === -1) {
    return Response.json({ error: 'Vídeo não encontrado' }, { status: 404 })
  }

  videos[idx] = { ...videos[idx], ...updates, id: params.id }
  await setVideos(videos)

  return Response.json(videos[idx])
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const videos = await getVideos()
  const filtered = videos.filter((v) => v.id !== params.id)

  if (filtered.length === videos.length) {
    return Response.json({ error: 'Vídeo não encontrado' }, { status: 404 })
  }

  await setVideos(filtered)
  return Response.json({ success: true })
}
