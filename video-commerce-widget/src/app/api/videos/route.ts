import { NextRequest } from 'next/server'
import { getVideos, addVideo } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { VideoItem } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const store = request.nextUrl.searchParams.get('store') ?? undefined
  const videos = await getVideos(store)
  return Response.json(videos, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const store = request.nextUrl.searchParams.get('store') ?? undefined

  let video: VideoItem
  try {
    video = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (
    !video.id ||
    !video.videoUrl ||
    !video.product?.name ||
    !video.product?.price ||
    !video.product?.url
  ) {
    return Response.json(
      {
        error:
          'Campos obrigatórios: id, videoUrl, product.name, product.price, product.url',
      },
      { status: 400 }
    )
  }

  await addVideo(video, store)
  return Response.json(video, { status: 201 })
}
