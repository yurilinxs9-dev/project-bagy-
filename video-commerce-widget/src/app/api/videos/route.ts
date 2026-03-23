import { getVideos, setVideos } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { VideoItem } from '@/types'

export async function GET() {
  const videos = await getVideos()
  return Response.json(videos)
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let video: VideoItem
  try {
    video = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!video.id || !video.videoUrl || !video.posterUrl || !video.product?.name) {
    return Response.json(
      { error: 'Campos obrigatórios: id, videoUrl, posterUrl, product.name' },
      { status: 400 }
    )
  }

  const videos = await getVideos()

  if (videos.find((v) => v.id === video.id)) {
    return Response.json({ error: 'ID já existe' }, { status: 409 })
  }

  videos.push(video)
  await setVideos(videos)

  return Response.json(video, { status: 201 })
}
