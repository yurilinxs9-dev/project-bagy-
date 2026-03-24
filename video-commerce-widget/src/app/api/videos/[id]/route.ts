import { updateVideo, deleteVideo } from '@/lib/kv'
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

  try {
    await updateVideo(params.id, updates)
  } catch {
    return Response.json(
      { error: 'Erro ao atualizar vídeo' },
      { status: 500 }
    )
  }

  return Response.json({ success: true, id: params.id })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await deleteVideo(params.id)
  } catch {
    return Response.json({ error: 'Erro ao remover vídeo' }, { status: 500 })
  }

  return Response.json({ success: true })
}
