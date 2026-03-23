import { getSettings, setSettings } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { WidgetSettings } from '@/types'

export async function GET() {
  const settings = await getSettings()
  return Response.json(settings)
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let settings: WidgetSettings
  try {
    settings = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  await setSettings(settings)
  return Response.json(settings)
}
