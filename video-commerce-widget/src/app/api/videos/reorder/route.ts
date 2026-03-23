import { setVideos } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { VideoItem } from '@/types'

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let videos: VideoItem[]
  try {
    videos = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!Array.isArray(videos)) {
    return Response.json({ error: 'Esperado um array de vídeos' }, { status: 400 })
  }

  await setVideos(videos)
  return Response.json({ success: true })
}
