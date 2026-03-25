import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { getJwtSecret } from '@/lib/auth'

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return Response.json(
      { error: 'Painel admin não configurado. Defina ADMIN_PASSWORD.' },
      { status: 503 }
    )
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  if (body.password?.trim() !== adminPassword.trim()) {
    return Response.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret())

  cookies().set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return Response.json({ success: true })
}
