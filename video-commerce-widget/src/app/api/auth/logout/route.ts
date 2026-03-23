import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('admin_token')
  return Response.json({ success: true })
}
