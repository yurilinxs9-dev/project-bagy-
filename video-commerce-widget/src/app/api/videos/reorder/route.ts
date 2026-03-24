import { reorderVideos } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!Array.isArray(body)) {
    return Response.json({ error: 'Esperado array' }, { status: 400 })
  }

  // Aceita VideoItem[] (backward compat) ou string[]
  const videoIds: string[] =
    body.length > 0 && typeof body[0] === 'object'
      ? (body as { id: string }[]).map((v) => v.id)
      : (body as string[])

  await reorderVideos(videoIds)
  return Response.json({ success: true })
}
