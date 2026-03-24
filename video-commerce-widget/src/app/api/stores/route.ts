import { NextRequest } from 'next/server'
import { getStores, addStore } from '@/lib/kv'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const stores = await getStores()
  return Response.json(stores)
}

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: { name: string; slug: string; storeUrl?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!body.name || !body.slug) {
    return Response.json(
      { error: 'name e slug são obrigatórios' },
      { status: 400 }
    )
  }

  try {
    const store = await addStore({
      name: body.name,
      slug: body.slug,
      storeUrl: body.storeUrl ?? '',
    })
    return Response.json(store, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar loja'
    return Response.json({ error: msg }, { status: 500 })
  }
}
