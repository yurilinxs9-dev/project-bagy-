import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function POST() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary não configurado' },
      { status: 503 }
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    folder: 'video-commerce',
    timestamp,
    use_filename: 'true',
    unique_filename: 'true',
  }

  const signature = cloudinary.utils.api_sign_request(params, apiSecret)

  return NextResponse.json({
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    folder: params.folder,
    use_filename: params.use_filename,
    unique_filename: params.unique_filename,
  })
}
