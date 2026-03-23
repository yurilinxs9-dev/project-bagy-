import { getVideos, addVideo } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { VideoItem } from '@/types'

export const dynamic = 'force-dynamic'

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

  if (!video.id || !video.videoUrl || !video.product?.name || !video.product?.price || !video.product?.url) {
    return Response.json(
      { error: 'Campos obrigatórios: id, videoUrl, product.name, product.price, product.url' },
      { status: 400 }
    )
  }

  await addVideo(video)

  return Response.json(video, { status: 201 })
}
