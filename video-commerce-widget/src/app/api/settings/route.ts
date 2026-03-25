import { NextRequest } from 'next/server'
import { getSettings, setSettings } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'
import { WidgetSettings } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const store = request.nextUrl.searchParams.get('store') ?? undefined
  const settings = await getSettings(store)
  return Response.json(settings, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function PUT(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const store = request.nextUrl.searchParams.get('store') ?? undefined

  let settings: WidgetSettings
  try {
    settings = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  await setSettings(settings, store)
  return Response.json(settings)
}
